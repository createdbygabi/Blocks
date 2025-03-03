import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  "https://qyhxynrzrnoevgyhmwny.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5aHh5bnJ6cm5vZXZneWhtd255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5MzY5OTAsImV4cCI6MjA1MjUxMjk5MH0.ZvKsLwbBCLUmjwwnX25IXsjXvf0jm04qY-2w9jaj7JU"
);

async function cleanupDatabase() {
  try {
    // Delete all records from landing_pages
    // const { error: landingPagesError } = await supabase
    //   .from("landing_pages")
    //   .delete()
    //   .filter("id", "not.is", null); // This will match all records since id cannot be null

    // if (landingPagesError) {
    //   console.error("Error deleting landing pages:", landingPagesError);
    // } else {
    //   console.log("Successfully deleted all landing pages");
    // }

    // Delete all records from businesses
    const { error: businessesError } = await supabase
      .from("businesses")
      .delete()
      .filter("id", "not.is", null); // This will match all records since id cannot be null

    if (businessesError) {
      console.error("Error deleting businesses:", businessesError);
    } else {
      console.log("Successfully deleted all businesses");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the cleanup
cleanupDatabase();
