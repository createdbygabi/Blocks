export async function setupStripe(data, state) {
  // Redirect to Stripe Connect OAuth
  const stripeConnectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write`;
  window.location.href = stripeConnectUrl;
}

export async function setupInstagram(data, state) {
  // Redirect to Instagram OAuth
  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${
    process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI
  )}&scope=basic&response_type=code`;
  window.location.href = instagramAuthUrl;
}
