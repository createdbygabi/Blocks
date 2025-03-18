import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET - Fetch all newsletters
export async function GET() {
  try {
    const { data: newsletters, error } = await supabaseAdmin
      .from("linkletter_newsletters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching newsletters:", error);
      return NextResponse.json(
        { error: "Failed to fetch newsletters" },
        { status: 500 }
      );
    }

    return NextResponse.json({ newsletters });
  } catch (error) {
    console.error("Error in GET /newsletters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Save a new newsletter
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      content,
      linkedin_urls,
      substack_urls,
      title,
      business_id,
      user_id,
    } = body;

    const { data: savedNewsletter, error: saveError } = await supabaseAdmin
      .from("linkletter_newsletters")
      .insert({
        user_id,
        business_id,
        content,
        linkedin_urls,
        substack_urls,
        title: title || `Newsletter #${Date.now()}`,
        status: "draft",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving newsletter:", saveError);
      return NextResponse.json(
        { error: "Failed to save newsletter" },
        { status: 500 }
      );
    }

    return NextResponse.json({ savedNewsletter });
  } catch (error) {
    console.error("Error in POST /newsletters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing newsletter
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, content, title, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Newsletter ID is required" },
        { status: 400 }
      );
    }

    const { data: updatedNewsletter, error: updateError } = await supabaseAdmin
      .from("linkletter_newsletters")
      .update({
        content,
        title,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating newsletter:", updateError);
      return NextResponse.json(
        { error: "Failed to update newsletter" },
        { status: 500 }
      );
    }

    return NextResponse.json({ newsletter: updatedNewsletter });
  } catch (error) {
    console.error("Error in PUT /newsletters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a newsletter
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Newsletter ID is required" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("linkletter_newsletters")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting newsletter:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete newsletter" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /newsletters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
