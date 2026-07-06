import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface PhotoLightboxProps {
  photoUris: string[];
  visibleIndex: number | null;
  onClose: () => void;
}

// react-native-image-viewing ships only .ios.js/.android.js -- no web
// variant at all, so Metro can't resolve it for a web bundle. This is a
// minimal from-scratch replacement for the web build: a full-screen Modal
// (Modal has real web support) with prev/next arrows and Escape/arrow-key
// navigation, since click/keyboard is the natural web interaction rather
// than the native library's swipe gesture. Metro picks this file
// automatically for web builds and the sibling PhotoLightbox.tsx for native.
export function PhotoLightbox({ photoUris, visibleIndex, onClose }: PhotoLightboxProps) {
  const [index, setIndex] = useState(visibleIndex ?? 0);

  useEffect(() => {
    if (visibleIndex !== null) {
      setIndex(visibleIndex);
    }
  }, [visibleIndex]);

  const visible = visibleIndex !== null;

  useEffect(() => {
    if (!visible) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex((current) => (current + 1) % photoUris.length);
      if (event.key === 'ArrowLeft') {
        setIndex((current) => (current - 1 + photoUris.length) % photoUris.length);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, photoUris.length, onClose]);

  if (!visible) return null;

  const showArrows = photoUris.length > 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </Pressable>

        {showArrows && (
          <Pressable
            style={[styles.arrowButton, styles.arrowLeft]}
            onPress={(event) => {
              event.stopPropagation();
              setIndex((current) => (current - 1 + photoUris.length) % photoUris.length);
            }}
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
        )}

        <Pressable onPress={(event) => event.stopPropagation()} style={styles.imageWrapper}>
          <Image source={{ uri: photoUris[index] }} style={styles.image} resizeMode="contain" />
        </Pressable>

        {showArrows && (
          <Pressable
            style={[styles.arrowButton, styles.arrowRight]}
            onPress={(event) => {
              event.stopPropagation();
              setIndex((current) => (current + 1) % photoUris.length);
            }}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '80%',
    height: '80%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 26,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: -24,
  },
  arrowLeft: {
    left: 16,
  },
  arrowRight: {
    right: 16,
  },
  arrowText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 32,
  },
});
