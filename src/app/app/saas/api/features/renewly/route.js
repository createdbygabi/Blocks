import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET - Fetch all tracked services
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const { data: subscriptions, error } = await supabaseAdmin
      .from("renewly_tracked_services")
      .select("*")
      .eq("user_id", userId)
      .order("next_billing", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Error fetching tracked services:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracked services" },
      { status: 500 }
    );
  }
}

// POST - Add new tracked service
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;

    const { data: subscription, error } = await supabaseAdmin
      .from("renewly_tracked_services")
      .insert({
        user_id: userId,
        service_name: body.name,
        amount: body.price,
        billing_cycle: body.billingCycle,
        next_billing: body.nextBilling,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error adding tracked service:", error);
    return NextResponse.json(
      { error: "Failed to add tracked service" },
      { status: 500 }
    );
  }
}

// DELETE - Remove tracked service
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    const { error } = await supabaseAdmin
      .from("renewly_tracked_services")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tracked service:", error);
    return NextResponse.json(
      { error: "Failed to delete tracked service" },
      { status: 500 }
    );
  }
}
