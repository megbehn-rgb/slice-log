import type { Profile } from '../context/ProfileContext';
import { supabase } from '../lib/supabase';
import type {
  NewRestaurantInput,
  Restaurant,
  RestaurantDetail,
  RestaurantUpdateInput,
  SortOption,
} from '../types/restaurant';
import { listOrderTypesByRestaurant, setOrderTypesForRestaurant } from './orderTypeRepository';
import { setTagsForRestaurant } from './tagRepository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Restaurant {
  return {
    id: Number(row.id),
    placeId: row.place_id,
    name: row.name,
    address: row.address,
    neighborhood: row.neighborhood,
    borough: row.borough,
    latitude: row.latitude,
    longitude: row.longitude,
    googleRating: row.google_rating,
    googleRatingCount: row.google_rating_count,
    tommyRating: row.tommy_rating,
    tommyReview: row.tommy_review,
    meghanRating: row.meghan_rating,
    meghanReview: row.meghan_review,
    visitDate: row.visit_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySort(query: any, sort: SortOption, ratingColumn: 'tommy_rating' | 'meghan_rating') {
  switch (sort) {
    case 'ratingDesc':
      return query
        .order(ratingColumn, { ascending: false, nullsFirst: false })
        .order('name', { ascending: true });
    case 'ratingAsc':
      return query
        .order(ratingColumn, { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });
    case 'visitDateDesc':
      return query
        .order('visit_date', { ascending: false, nullsFirst: false })
        .order('name', { ascending: true });
    case 'visitDateAsc':
      return query
        .order('visit_date', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });
    case 'alphabetical':
      return query.order('name', { ascending: true });
  }
}

export async function listRestaurants(options: {
  sort: SortOption;
  search: string;
  tagFilter?: string | null;
  orderTypeFilter?: string | null;
  // Whose rating "High-Low"/"Low-High" sorts by -- only matters for the
  // ratingDesc/ratingAsc sort options, so callers that only ever use other
  // sorts (e.g. the map screen's alphabetical sort) can omit it.
  ratingProfile?: Profile;
}): Promise<Restaurant[]> {
  const search = options.search.trim();
  const tagFilter = options.tagFilter ?? null;
  const orderTypeFilter = options.orderTypeFilter ?? null;
  const ratingColumn = options.ratingProfile === 'Meghan' ? 'meghan_rating' : 'tommy_rating';

  // Embedding a related table with `!inner` in the select list is the
  // PostgREST equivalent of the old SQLite "EXISTS (SELECT 1 FROM ... )"
  // filters — it turns the join into a filter on the parent rows.
  const selectParts = ['*'];
  if (tagFilter) selectParts.push('restaurant_tags!inner(tag)');
  if (orderTypeFilter) selectParts.push('restaurant_order_types!inner(order_type)');

  let query = supabase.from('restaurants').select(selectParts.join(', '));

  if (search) {
    // Strip characters that have special meaning in PostgREST's filter
    // string syntax so a stray comma/paren in a search term can't corrupt
    // the `.or()` expression.
    const safeSearch = search.replace(/[,()]/g, '');
    const likeTerm = `%${safeSearch}%`;
    query = query.or(`name.ilike.${likeTerm},neighborhood.ilike.${likeTerm},borough.ilike.${likeTerm}`);
  }
  if (tagFilter) {
    query = query.eq('restaurant_tags.tag', tagFilter);
  }
  if (orderTypeFilter) {
    query = query.eq('restaurant_order_types.order_type', orderTypeFilter);
  }

  const { data, error } = await applySort(query, options.sort, ratingColumn);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getRestaurantByPlaceId(placeId: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('place_id', placeId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function getRestaurantById(id: number): Promise<RestaurantDetail | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*, photos(*), restaurant_tags(tag), restaurant_order_types(order_type)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const photos = (data.photos ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (photo: any) => ({
      id: Number(photo.id),
      restaurantId: Number(photo.restaurant_id),
      uri: photo.uri,
      createdAt: photo.created_at,
    })
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags = (data.restaurant_tags ?? []).map((row: any) => row.tag as string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderTypes = (data.restaurant_order_types ?? []).map((row: any) => row.order_type as string);

  return { ...mapRow(data), photos, tags, orderTypes };
}

export async function insertRestaurant(input: NewRestaurantInput): Promise<number> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      place_id: input.placeId,
      name: input.name,
      address: input.address,
      neighborhood: input.neighborhood,
      borough: input.borough,
      latitude: input.latitude,
      longitude: input.longitude,
      google_rating: input.googleRating,
      google_rating_count: input.googleRatingCount,
      tommy_rating: input.tommyRating,
      tommy_review: input.tommyReview,
      meghan_rating: input.meghanRating,
      meghan_review: input.meghanReview,
      visit_date: input.visitDate,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();
  if (error) throw error;

  const restaurantId = Number(data.id);

  try {
    if (input.photoUris.length > 0) {
      const { error: photosError } = await supabase
        .from('photos')
        .insert(input.photoUris.map((uri) => ({ restaurant_id: restaurantId, uri, created_at: now })));
      if (photosError) throw photosError;
    }
    await setTagsForRestaurant(restaurantId, input.tags);
    await setOrderTypesForRestaurant(restaurantId, input.orderTypes);
  } catch (err) {
    // Best-effort compensating rollback: Supabase's client doesn't expose a
    // simple client-side multi-table transaction, so if a later insert
    // fails, clean up the restaurant row rather than leave an orphan with
    // no photos/tags/order-types.
    await supabase.from('restaurants').delete().eq('id', restaurantId);
    throw err;
  }

  return restaurantId;
}

export async function updateRestaurant(id: number, input: RestaurantUpdateInput): Promise<void> {
  const { error } = await supabase
    .from('restaurants')
    .update({
      tommy_rating: input.tommyRating,
      tommy_review: input.tommyReview,
      meghan_rating: input.meghanRating,
      meghan_review: input.meghanReview,
      visit_date: input.visitDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;

  await setTagsForRestaurant(id, input.tags);
  await setOrderTypesForRestaurant(id, input.orderTypes);
}
