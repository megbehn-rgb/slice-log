import { supabase } from '../lib/supabase';
import type { Photo } from '../types/restaurant';

const PHOTOS_BUCKET = 'photos';

interface PhotoRow {
  id: number;
  restaurant_id: number;
  uri: string;
  created_at: string;
}

function mapRow(row: PhotoRow): Photo {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    uri: row.uri,
    createdAt: row.created_at,
  };
}

export async function listPhotosByRestaurant(restaurantId: number): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

// Uploads a local (camera/library) file straight to Supabase Storage and
// returns its public URL. Called from PhotoPicker at pick-time, before the
// photo is ever recorded in the `photos` table — everywhere else in the app
// just deals with an array of URI strings, same as when they were local
// file:// paths.
//
// mimeType comes straight from the picker result when available. On native,
// localUri is a real file:// path so sniffing the extension is a reliable
// fallback -- but on web, expo-image-picker returns a blob:http://... URI
// with no real extension, so without an explicit mimeType this would upload
// with a garbage content-type/extension.
export async function uploadPhotoFile(localUri: string, mimeType?: string): Promise<string> {
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const extensionFromMimeType = mimeType?.split('/').pop()?.toLowerCase();
  const extension = extensionFromMimeType || localUri.split('.').pop()?.toLowerCase() || 'jpg';
  const contentType = mimeType || (extension === 'jpg' ? 'image/jpeg' : `image/${extension}`);
  const path = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`;

  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, arrayBuffer, { contentType });
  if (error) throw error;

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function addPhoto(restaurantId: number, uri: string): Promise<Photo> {
  const { data, error } = await supabase
    .from('photos')
    .insert({ restaurant_id: restaurantId, uri })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${PHOTOS_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1 ? null : publicUrl.slice(index + marker.length);
}

export async function deletePhoto(photoId: number, uri: string): Promise<void> {
  const path = extractStoragePath(uri);
  if (path) {
    try {
      await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
    } catch {
      // Best-effort — don't block deleting the DB row if the storage
      // object is already gone or the URL didn't parse as expected.
    }
  }
  const { error } = await supabase.from('photos').delete().eq('id', photoId);
  if (error) throw error;
}
