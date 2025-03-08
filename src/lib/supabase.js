import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Step 1: Send OTP
export async function sendOTP(email) {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // Default expiration is 5 minutes
    },
  });
}

// Step 2: Verify OTP and get session
export async function verifyOTP(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) throw error;
  return { session: data.session, user: data.user };
}

// Get current session
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Sign out
export async function signOut() {
  return await supabase.auth.signOut();
}

// Listen to auth changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event, session?.user?.email);
    callback(session);
  });
}

// Send magic link email
export async function sendMagicLink(email, businessSubdomain) {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      type: "magiclink",
      emailRedirectTo: `http://${businessSubdomain}.localhost:3000/dashboard`,
      shouldCreateUser: true,
    },
  });
}
