import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { DateField } from '../../src/components/DateField';
import { LoadingIndicator } from '../../src/components/LoadingIndicator';
import { OrderTypeSelector } from '../../src/components/OrderTypeSelector';
import { PhotoLightbox } from '../../src/components/PhotoLightbox';
import { PhotoPicker } from '../../src/components/PhotoPicker';
import { RatingBadge } from '../../src/components/RatingBadge';
import { RatingInput } from '../../src/components/RatingInput';
import { ShareCard } from '../../src/components/ShareCard';
import { TagSelector } from '../../src/components/TagSelector';
import { COLORS } from '../../src/constants/colors';
import {
  FONT_BODY_BOLD,
  FONT_BODY_REGULAR,
  FONT_BODY_SEMIBOLD,
  FONT_DISPLAY_BOLD,
} from '../../src/constants/typography';
import { useProfile } from '../../src/context/ProfileContext';
import { addPhoto, deletePhoto } from '../../src/db/photoRepository';
import { getRestaurantById, updateRestaurant } from '../../src/db/restaurantRepository';
import type { RestaurantDetail } from '../../src/types/restaurant';
import { formatDateForDisplay } from '../../src/utils/date';
import { buildGoogleMapsUrl } from '../../src/utils/mapsLink';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantId = Number(id);
  const { activeProfile } = useProfile();
  const navigation = useNavigation();

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<View>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [editVisitDate, setEditVisitDate] = useState('');
  const [editTommyRating, setEditTommyRating] = useState<number | null>(null);
  const [editTommyReview, setEditTommyReview] = useState('');
  const [editMeghanRating, setEditMeghanRating] = useState<number | null>(null);
  const [editMeghanReview, setEditMeghanReview] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editOrderTypes, setEditOrderTypes] = useState<string[]>([]);
  const [editPhotoUris, setEditPhotoUris] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRestaurantById(restaurantId);
      setRestaurant(result);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (restaurant) {
      navigation.setOptions({ title: restaurant.name });
    }
  }, [restaurant, navigation]);

  function startEditing() {
    if (!restaurant) return;
    setEditVisitDate(restaurant.visitDate);
    setEditTommyRating(restaurant.tommyRating);
    setEditTommyReview(restaurant.tommyReview);
    setEditMeghanRating(restaurant.meghanRating);
    setEditMeghanReview(restaurant.meghanReview);
    setEditTags(restaurant.tags);
    setEditOrderTypes(restaurant.orderTypes);
    setEditPhotoUris(restaurant.photos.map((photo) => photo.uri));
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function saveEditing() {
    if (!restaurant) return;
    setSaving(true);
    try {
      await updateRestaurant(restaurant.id, {
        tommyRating: editTommyRating,
        tommyReview: editTommyReview,
        meghanRating: editMeghanRating,
        meghanReview: editMeghanReview,
        visitDate: editVisitDate,
        orderTypes: editOrderTypes,
        tags: editTags,
      });

      // New photos were already uploaded to Storage at pick-time (see
      // PhotoPicker) — the only work left here is diffing which ones to
      // record/remove in the `photos` table.
      const originalUris = restaurant.photos.map((photo) => photo.uri);
      const removedPhotos = restaurant.photos.filter(
        (photo) => !editPhotoUris.includes(photo.uri)
      );
      const addedUris = editPhotoUris.filter((uri) => !originalUris.includes(uri));

      for (const photo of removedPhotos) {
        await deletePhoto(photo.id, photo.uri);
      }
      for (const uri of addedUris) {
        await addPhoto(restaurant.id, uri);
      }

      setEditing(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  function openInMaps() {
    if (!restaurant) return;
    const url = buildGoogleMapsUrl({
      placeId: restaurant.placeId,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    });
    Linking.openURL(url);
  }

  async function handleShare() {
    if (!restaurant || !shareCardRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing not available', "Sharing isn't supported on this device.");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: restaurant.name });
    } catch (error) {
      Alert.alert('Could not share', 'Something went wrong while creating the share image.');
      console.warn(error);
    } finally {
      setSharing(false);
    }
  }

  if (loading || !restaurant) {
    return (
      <View style={styles.centered}>
        <LoadingIndicator message="Fetching your slice history…" />
      </View>
    );
  }

  const location = [restaurant.neighborhood, restaurant.borough]
    .filter((part) => !!part)
    .join(', ');

  // Both people's sections are always fully visible/editable — the active
  // profile only affects which one renders first, as a "you're probably
  // filling this one in" convenience, not a restriction.
  const editSections = [
    {
      person: 'Tommy' as const,
      rating: editTommyRating,
      setRating: setEditTommyRating,
      review: editTommyReview,
      setReview: setEditTommyReview,
    },
    {
      person: 'Meghan' as const,
      rating: editMeghanRating,
      setRating: setEditMeghanRating,
      review: editMeghanReview,
      setReview: setEditMeghanReview,
    },
  ];
  const orderedEditSections =
    activeProfile === 'Meghan' ? [...editSections].reverse() : editSections;

  const reviewSections = [
    { person: 'Tommy' as const, review: restaurant.tommyReview },
    { person: 'Meghan' as const, review: restaurant.meghanReview },
  ];
  const orderedReviewSections =
    activeProfile === 'Meghan' ? [...reviewSections].reverse() : reviewSections;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.name}>{restaurant.name}</Text>
      <Text style={styles.address}>{restaurant.address}</Text>
      {!!location && <Text style={styles.location}>{location}</Text>}
      <Text style={styles.visitDate}>Visited {formatDateForDisplay(restaurant.visitDate)}</Text>

      <View style={styles.badgeRow}>
        <RatingBadge
          label="Tommy's Rating"
          value={restaurant.tommyRating}
          maxValue={10}
          color={COLORS.tomato}
        />
        <RatingBadge
          label="Meghan's Rating"
          value={restaurant.meghanRating}
          maxValue={10}
          color={COLORS.crust}
        />
        <RatingBadge
          label="Google"
          value={restaurant.googleRating}
          maxValue={5}
          color={COLORS.googleBlue}
        />
      </View>

      {(restaurant.tags.length > 0 || restaurant.orderTypes.length > 0) && (
        <View style={styles.tagRow}>
          {restaurant.tags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagPillText}>{tag}</Text>
            </View>
          ))}
          {restaurant.orderTypes.map((orderType) => (
            <View key={orderType} style={[styles.tagPill, styles.orderTypePill]}>
              <Text style={styles.tagPillText}>Ordered: {orderType}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.mapsButton,
            styles.actionButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={openInMaps}
        >
          <Text style={styles.mapsButtonText}>Open in Google Maps</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.shareButton,
            styles.actionButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator color={COLORS.basil} />
          ) : (
            <Text style={styles.shareButtonText}>Share</Text>
          )}
        </Pressable>
      </View>

      {/* Off-screen — exists only to be captured as an image by handleShare. */}
      <View style={styles.offscreen} pointerEvents="none">
        <ShareCard
          ref={shareCardRef}
          data={{
            name: restaurant.name,
            location,
            photoUri: restaurant.photos[0]?.uri ?? null,
            tommyRating: restaurant.tommyRating,
            meghanRating: restaurant.meghanRating,
          }}
        />
      </View>

      {editing ? (
        <>
          <Text style={styles.sectionLabel}>Visit Date</Text>
          <DateField value={editVisitDate} onChange={setEditVisitDate} />

          {orderedEditSections.map((section) => (
            <View key={section.person}>
              <Text style={styles.sectionLabel}>
                {section.person}'s Rating{section.person === activeProfile ? ' (You)' : ''}
              </Text>
              <RatingInput value={section.rating} onChange={section.setRating} />

              <Text style={styles.sectionLabel}>
                {section.person}'s Review{section.person === activeProfile ? ' (You)' : ''}
              </Text>
              <TextInput
                style={styles.reviewInput}
                multiline
                value={section.review}
                onChangeText={section.setReview}
                placeholder={`What did ${section.person} think of the slice?`}
              />
            </View>
          ))}

          <Text style={styles.sectionLabel}>Pizza Style</Text>
          <TagSelector selectedTags={editTags} onChange={setEditTags} />

          <Text style={styles.sectionLabel}>What Was Ordered</Text>
          <OrderTypeSelector selectedOrderTypes={editOrderTypes} onChange={setEditOrderTypes} />

          <Text style={styles.sectionLabel}>Photos</Text>
          <PhotoPicker photoUris={editPhotoUris} onChange={setEditPhotoUris} />

          <View style={styles.editActions}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
              onPress={cancelEditing}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                saving && styles.saveButtonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={saveEditing}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {orderedReviewSections.map((section) => (
            <View key={section.person}>
              <Text style={styles.sectionLabel}>
                {section.person}'s Review{section.person === activeProfile ? ' (You)' : ''}
              </Text>
              <Text style={styles.reviewText}>{section.review || 'No review written yet.'}</Text>
            </View>
          ))}

          {restaurant.photos.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Photos</Text>
              <View style={styles.photoGrid}>
                {restaurant.photos.map((photo, index) => (
                  <Pressable key={photo.id} onPress={() => setLightboxIndex(index)}>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                  </Pressable>
                ))}
              </View>
              <PhotoLightbox
                photoUris={restaurant.photos.map((photo) => photo.uri)}
                visibleIndex={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
              />
            </>
          )}

          <Pressable
            style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressed]}
            onPress={startEditing}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    backgroundColor: COLORS.cream,
    flexGrow: 1,
  },
  name: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 24,
  },
  address: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  location: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  visitDate: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  orderTypePill: {
    backgroundColor: COLORS.creamTint,
  },
  tagPillText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 13,
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  mapsButton: {
    borderWidth: 1,
    borderColor: COLORS.googleBlue,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  mapsButtonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    color: COLORS.googleBlue,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: COLORS.basil,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    color: COLORS.basil,
  },
  offscreen: {
    position: 'absolute',
    top: -9999,
    left: -9999,
  },
  sectionLabel: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 13,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
  },
  reviewText: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 15,
    color: '#333',
    lineHeight: 21,
  },
  reviewInput: {
    fontFamily: FONT_BODY_REGULAR,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 90,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  editButton: {
    marginTop: 32,
    backgroundColor: '#333',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: FONT_BODY_BOLD,
    color: '#fff',
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    color: '#333',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.tomato,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: FONT_BODY_BOLD,
    color: '#fff',
    fontSize: 16,
  },
});
