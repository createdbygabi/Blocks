import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  const { subdomain } = params;
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: saas, error } = await supabase
      .from("saas_apps")
      .select("*")
      .eq("subdomain", subdomain)
      .single();

    if (error) throw error;
    if (!saas) {
      return NextResponse.json({ error: "SaaS not found" }, { status: 404 });
    }

    return NextResponse.json(saas);
  } catch (error) {
    console.error("Error fetching SaaS data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
