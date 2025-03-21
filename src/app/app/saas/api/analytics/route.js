import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "edge"; // Use edge runtime for better performance

export async function POST(request) {
  console.log("🔄 Analytics Event Received");
  try {
    const events = await request.json();
    const eventsArray = Array.isArray(events) ? events : [events];

    // Log the events
    eventsArray.forEach((event) => {
      console.log(`📊 Processing ${event.event_name}`, {
        session_id: event.properties?.session_id,
        business_name: event.properties?.business_name,
      });
    });

    // Batch insert all events
    const { data, error } = await supabaseAdmin
      .from("analytics_events")
      .insert(eventsArray);

    if (error) throw error;

    console.log(`✅ Successfully processed ${eventsArray.length} events`);
    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Error processing analytics events:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// If you need active visitors count, create a function to calculate it on demand:
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) {
    return new Response("Business ID required", { status: 400 });
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  // Get active visitors count directly from analytics_events
  const { count } = await supabaseAdmin
    .from("analytics_events")
    .select("properties->session_id", { count: "exact", distinct: true })
    .eq("event_name", "heartbeat")
    .eq("properties->business_id", businessId)
    .gte("created_at", fiveMinutesAgo.toISOString());

  return new Response(JSON.stringify({ active_visitors: count }), {
    headers: { "Content-Type": "application/json" },
  });
}
