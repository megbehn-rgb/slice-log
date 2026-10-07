import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { autocompletePizzaPlaces, getPlaceDetails } from '../src/api/googlePlaces';
import type { PlaceDetails, PlacePrediction } from '../src/api/places.types';
import { DateField } from '../src/components/DateField';
import { LoadingIndicator } from '../src/components/LoadingIndicator';
import { OrderTypeSelector } from '../src/components/OrderTypeSelector';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { RatingInput } from '../src/components/RatingInput';
import { TagSelector } from '../src/components/TagSelector';
import { COLORS } from '../src/constants/colors';
import {
  FONT_BODY_BOLD,
  FONT_BODY_REGULAR,
  FONT_BODY_SEMIBOLD,
  FONT_DISPLAY_BOLD,
} from '../src/constants/typography';
import { useProfile } from '../src/context/ProfileContext';
import { getRestaurantByPlaceId, insertRestaurant } from '../src/db/restaurantRepository';
import { todayDateString } from '../src/utils/date';

export default function AddRestaurantScreen() {
  const router = useRouter();
  const { activeProfile } = useProfile();

  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [checkingSelection, setCheckingSelection] = useState(false);

  const [selectedDetails, setSelectedDetails] = useState<PlaceDetails | null>(null);
  const [visitDate, setVisitDate] = useState(todayDateString());
  const [tommyRating, setTommyRating] = useState<number | null>(null);
  const [tommyReview, setTommyReview] = useState('');
  const [meghanRating, setMeghanRating] = useState<number | null>(null);
  const [meghanReview, setMeghanReview] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [orderTypes, setOrderTypes] = useState<string[]>([]);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setPredictions([]);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoadingPredictions(true);
      setSearchError(null);
      try {
        const results = await autocompletePizzaPlaces(query, controller.signal);
        setPredictions(results);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          // Log the real status/message for debugging, but keep the UI
          // message generic -- a thrown request (bad key, 403, quota,
          // network error) is NOT the same as a search that succeeded with
          // zero results, and must not land on the same "no results" text.
          console.warn('Autocomplete failed', error);
          setPredictions([]);
          setSearchError('Search failed. Check your connection or API key, then try again.');
        }
      } finally {
        setLoadingPredictions(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  async function handleSelectPrediction(prediction: PlacePrediction) {
    setCheckingSelection(true);
    try {
      const existing = await getRestaurantByPlaceId(prediction.placeId);
      if (existing) {
        router.replace({ pathname: '/restaurant/[id]', params: { id: existing.id } });
        return;
      }

      const details = await getPlaceDetails(prediction.placeId);
      setSelectedDetails(details);
      setVisitDate(todayDateString());
      setTommyRating(null);
      setTommyReview('');
      setMeghanRating(null);
      setMeghanReview('');
      setTags([]);
      setOrderTypes([]);
      setPhotoUris([]);
    } catch (error) {
      Alert.alert('Something went wrong', 'Could not load that restaurant. Please try again.');
      console.warn(error);
    } finally {
      setCheckingSelection(false);
    }
  }

  async function handleSave() {
    if (!selectedDetails) {
      return;
    }

    setSaving(true);
    try {
      const id = await insertRestaurant({
        placeId: selectedDetails.placeId,
        name: selectedDetails.name,
        address: selectedDetails.address,
        neighborhood: selectedDetails.neighborhood,
        borough: selectedDetails.borough,
        latitude: selectedDetails.latitude,
        longitude: selectedDetails.longitude,
        googleRating: selectedDetails.googleRating,
        googleRatingCount: selectedDetails.googleRatingCount,
        tommyRating,
        tommyReview,
        meghanRating,
        meghanReview,
        visitDate,
        orderTypes,
        tags,
        photoUris,
      });
      router.replace({ pathname: '/restaurant/[id]', params: { id } });
    } catch (error) {
      const existing = await getRestaurantByPlaceId(selectedDetails.placeId);
      if (existing) {
        router.replace({ pathname: '/restaurant/[id]', params: { id: existing.id } });
        return;
      }
      Alert.alert('Could not save', 'Something went wrong while saving this restaurant.');
      console.warn(error);
    } finally {
      setSaving(false);
    }
  }

  if (selectedDetails) {
    // Both people's sections are always fully visible/editable — the active
    // profile only affects which one renders first, as a "you're probably
    // filling this one in" convenience, not a restriction.
    const ratingSections = [
      {
        person: 'Tommy' as const,
        rating: tommyRating,
        setRating: setTommyRating,
        review: tommyReview,
        setReview: setTommyReview,
      },
      {
        person: 'Meghan' as const,
        rating: meghanRating,
        setRating: setMeghanRating,
        review: meghanReview,
        setReview: setMeghanReview,
      },
    ];
    const orderedSections =
      activeProfile === 'Meghan' ? [...ratingSections].reverse() : ratingSections;

    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.formContent}>
          <Pressable onPress={() => setSelectedDetails(null)}>
            <Text style={styles.changeSelection}>‹ Change search</Text>
          </Pressable>

          <Text style={styles.placeName}>{selectedDetails.name}</Text>
          <Text style={styles.placeAddress}>{selectedDetails.address}</Text>
          {selectedDetails.googleRating !== null && (
            <Text style={styles.googleRatingText}>
              Google rating: {selectedDetails.googleRating.toFixed(1)}★
              {selectedDetails.googleRatingCount !== null
                ? ` (${selectedDetails.googleRatingCount})`
                : ''}
            </Text>
          )}

          <Text style={styles.sectionLabel}>Visit Date</Text>
          <DateField value={visitDate} onChange={setVisitDate} />

          {orderedSections.map((section) => (
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
                placeholder={`What did ${section.person} think of the slice?`}
                value={section.review}
                onChangeText={section.setReview}
              />
            </View>
          ))}

          <Text style={styles.sectionLabel}>Pizza Style</Text>
          <TagSelector selectedTags={tags} onChange={setTags} />

          <Text style={styles.sectionLabel}>What Was Ordered</Text>
          <OrderTypeSelector selectedOrderTypes={orderTypes} onChange={setOrderTypes} />

          <Text style={styles.sectionLabel}>Photos</Text>
          <PhotoPicker photoUris={photoUris} onChange={setPhotoUris} />

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              saving && styles.saveButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flex}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a pizza place…"
        value={query}
        onChangeText={setQuery}
        autoFocus
        clearButtonMode="while-editing"
      />
      {(loadingPredictions || checkingSelection) && (
        <View style={styles.spinner}>
          <LoadingIndicator message="Scouting the neighborhood…" />
        </View>
      )}
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.placeId}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.predictionRow, pressed && styles.predictionRowPressed]}
            onPress={() => handleSelectPrediction(item)}
          >
            <Text style={styles.predictionMain}>{item.mainText}</Text>
            {!!item.secondaryText && (
              <Text style={styles.predictionSecondary}>{item.secondaryText}</Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          query.trim() && !loadingPredictions ? (
            <Text style={[styles.noResults, searchError && styles.searchErrorText]}>
              {searchError ?? 'No pizza places found.'}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  searchInput: {
    fontFamily: FONT_BODY_REGULAR,
    margin: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  spinner: {
    marginBottom: 8,
  },
  predictionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  predictionRowPressed: {
    backgroundColor: COLORS.creamTint,
  },
  predictionMain: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 16,
  },
  predictionSecondary: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noResults: {
    fontFamily: FONT_BODY_REGULAR,
    textAlign: 'center',
    color: '#888',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  searchErrorText: {
    color: COLORS.tomato,
    fontFamily: FONT_BODY_SEMIBOLD,
  },
  formContent: {
    padding: 20,
    gap: 6,
  },
  changeSelection: {
    fontFamily: FONT_BODY_SEMIBOLD,
    color: COLORS.tomato,
    fontSize: 15,
    marginBottom: 12,
  },
  placeName: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 22,
  },
  placeAddress: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  googleRatingText: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 13,
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
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
  saveButton: {
    marginTop: 28,
    backgroundColor: COLORS.tomato,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  saveButtonText: {
    fontFamily: FONT_BODY_BOLD,
    color: '#fff',
    fontSize: 17,
  },
});
