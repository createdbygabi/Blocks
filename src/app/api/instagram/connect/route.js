import { NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const { username, password, businessId } = await request.json();

    if (!username || !password || !businessId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("🔑 Connecting Instagram account for business:", businessId);
    console.log("🔑 Username:", username);

    // Encrypt the password before storing
    const encryptedPassword = await encrypt(password);

    // Prepare the credentials object
    const credentials = {
      username: username,
      password: encryptedPassword,
      connected: true,
      connected_at: new Date().toISOString(),
    };

    console.log("📦 Preparing to store credentials:", {
      ...credentials,
      password: "[ENCRYPTED]",
    });

    // Update the business directly with admin client
    const { data: updatedBusiness, error: updateError } = await supabaseAdmin
      .from("businesses")
      .update({
        ig_account_credentials: credentials,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating business:", updateError);
      return NextResponse.json(
        { message: "Failed to update business", error: updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ Business updated successfully:", {
      id: updatedBusiness?.id,
      hasCredentials: !!updatedBusiness?.ig_account_credentials,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedBusiness.id,
        ig_account_credentials: {
          ...updatedBusiness.ig_account_credentials,
          password: "[ENCRYPTED]",
        },
      },
    });
  } catch (error) {
    console.error("Instagram connection error:", error);
    return NextResponse.json(
      { message: "Failed to connect Instagram account", error: error.message },
      { status: 500 }
    );
  }
}
