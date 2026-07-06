import { supabase } from '../lib/supabase';

export async function listOrderTypesByRestaurant(restaurantId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('restaurant_order_types')
    .select('order_type')
    .eq('restaurant_id', restaurantId)
    .order('order_type', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => row.order_type as string);
}

// Replace-all semantics: simplest way to reconcile a multi-select chip UI's
// full selection state with the stored rows, without diffing additions vs
// removals.
export async function setOrderTypesForRestaurant(
  restaurantId: number,
  orderTypes: string[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('restaurant_order_types')
    .delete()
    .eq('restaurant_id', restaurantId);
  if (deleteError) throw deleteError;

  if (orderTypes.length === 0) return;

  const { error: insertError } = await supabase
    .from('restaurant_order_types')
    .insert(orderTypes.map((orderType) => ({ restaurant_id: restaurantId, order_type: orderType })));
  if (insertError) throw insertError;
}
