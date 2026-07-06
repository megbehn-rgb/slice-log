import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { uploadPhotoFile } from '../db/photoRepository';
import { PhotoLightbox } from './PhotoLightbox';

interface PickedAsset {
  uri: string;
  mimeType?: string;
}

interface PhotoPickerProps {
  photoUris: string[];
  onChange: (uris: string[]) => void;
}

export function PhotoPicker({ photoUris, onChange }: PhotoPickerProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Enable camera access in Settings to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.7 });
    if (result.canceled || !result.assets.length) {
      return;
    }

    await uploadAndAppend(
      result.assets.map((asset) => ({ uri: asset.uri, mimeType: asset.mimeType }))
    );
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo library access needed',
        'Enable photo library access in Settings to attach a photo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
      allowsMultipleSelection: true,
    });
    if (result.canceled || !result.assets.length) {
      return;
    }

    await uploadAndAppend(
      result.assets.map((asset) => ({ uri: asset.uri, mimeType: asset.mimeType }))
    );
  }

  async function uploadAndAppend(assets: PickedAsset[]) {
    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        assets.map((asset) => uploadPhotoFile(asset.uri, asset.mimeType))
      );
      onChange([...photoUris, ...uploadedUrls]);
    } catch (error) {
      Alert.alert('Could not upload photo', 'Check your connection and try again.');
      console.warn(error);
    } finally {
      setUploading(false);
    }
  }

  function handleAddPress() {
    // RN's Alert.alert on web only supports a message + OK/Cancel via
    // window.alert/confirm, not a custom 3-option list -- and it's
    // redundant there anyway, since the browser's own file picker already
    // lets the user choose camera vs. library on mobile Safari.
    if (Platform.OS === 'web') {
      pickFromLibrary();
      return;
    }

    Alert.alert('Add Photo', undefined, [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleRemove(uri: string) {
    // Only drop it from the working list here — the caller decides when (and
    // whether) to actually delete the underlying Storage object, since this
    // component doesn't know if the removal will ultimately be saved or
    // canceled.
    onChange(photoUris.filter((existing) => existing !== uri));
  }

  return (
    <View style={styles.grid}>
      {photoUris.map((uri, index) => (
        <View key={uri} style={styles.thumbnailWrapper}>
          <Pressable onPress={() => setLightboxIndex(index)}>
            <Image source={{ uri }} style={styles.thumbnail} />
          </Pressable>
          <Pressable style={styles.removeButton} onPress={() => handleRemove(uri)}>
            <Text style={styles.removeButtonText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={styles.addButton} onPress={handleAddPress} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={COLORS.tomato} />
        ) : (
          <Text style={styles.addButtonText}>+</Text>
        )}
      </Pressable>
      <PhotoLightbox
        photoUris={photoUris}
        visibleIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </View>
  );
}

const THUMBNAIL_SIZE = 80;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
  },
  addButton: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: '#999',
  },
});
