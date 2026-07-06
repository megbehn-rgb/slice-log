import { supabase } from '../lib/supabase';

export async function listTagsByRestaurant(restaurantId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('restaurant_tags')
    .select('tag')
    .eq('restaurant_id', restaurantId)
    .order('tag', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => row.tag as string);
}

// Replace-all semantics: simplest way to reconcile a multi-select chip UI's
// full selection state with the stored rows, without diffing additions vs
// removals.
export async function setTagsForRestaurant(restaurantId: number, tags: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('restaurant_tags')
    .delete()
    .eq('restaurant_id', restaurantId);
  if (deleteError) throw deleteError;

  if (tags.length === 0) return;

  const { error: insertError } = await supabase
    .from('restaurant_tags')
    .insert(tags.map((tag) => ({ restaurant_id: restaurantId, tag })));
  if (insertError) throw insertError;
}
