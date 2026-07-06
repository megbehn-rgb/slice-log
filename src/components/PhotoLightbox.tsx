import ImageViewing from 'react-native-image-viewing';

interface PhotoLightboxProps {
  photoUris: string[];
  visibleIndex: number | null;
  onClose: () => void;
}

// react-native-image-viewing is pure JS (no native module), so it works
// fine in Expo Go. It already provides a default close button plus
// swipe-to-dismiss/swipe-between-images, so no custom header/gesture code
// is needed here.
export function PhotoLightbox({ photoUris, visibleIndex, onClose }: PhotoLightboxProps) {
  return (
    <ImageViewing
      images={photoUris.map((uri) => ({ uri }))}
      imageIndex={visibleIndex ?? 0}
      visible={visibleIndex !== null}
      onRequestClose={onClose}
    />
  );
}
