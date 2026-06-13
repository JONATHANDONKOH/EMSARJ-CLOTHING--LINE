import supabase from "../supabasefol/supabaseClient";

async function addToWishlist(productId, userId) {
  const { data, error } = await supabase
    .from('wishlists')
    .insert([{ user_id: userId, product_id: productId }]);

  if (error) {
    console.error('Error adding to wishlist:', error.message);
  } else {
    console.log('Added to wishlist:', data);
  }
}
