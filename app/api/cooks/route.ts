import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("cook")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cooks",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") || "").trim();
    const mobile_number = String(formData.get("mobile_number") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const area = String(formData.get("area") || "").trim();
    const is_non_vegetarian =
      String(formData.get("is_non_vegetarian") || "false") === "true";

    const available_slots = formData.getAll("available_slots").map(String);
    const cuisines = formData.getAll("cuisines").map(String);

    const photo = formData.get("photo");

    if (!name || !mobile_number || !city || !area) {
      return NextResponse.json(
        {
          success: false,
          error: "name, mobile_number, city and area are required",
        },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(mobile_number)) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a valid 10-digit mobile number",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(available_slots) || available_slots.length < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Select at least one available slot",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(cuisines) || cuisines.length < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Select at least one cuisine",
        },
        { status: 400 }
      );
    }

    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cook photo is required",
        },
        { status: 400 }
      );
    }

    // Check if mobile number already exists
    const { data: existingCook, error: existingCookError } = await supabaseAdmin
      .from("cook")
      .select("id")
      .eq("mobile_number", mobile_number)
      .maybeSingle();

    if (existingCookError) {
      return NextResponse.json(
        {
          success: false,
          error: existingCookError.message,
        },
        { status: 500 }
      );
    }

    if (existingCook) {
      return NextResponse.json(
        {
          success: false,
          error: "This mobile number is already registered",
        },
        { status: 409 }
      );
    }

    const fileExt = photo.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${mobile_number}.${fileExt}`;
    const filePath = `cook/${fileName}`;

    const arrayBuffer = await photo.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("cook-photos")
      .upload(filePath, fileBuffer, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          error: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("cook-photos")
      .getPublicUrl(filePath);

    const photo_url = publicUrlData.publicUrl;

    const { data, error } = await supabaseAdmin
      .from("cook")
      .insert([
        {
          name,
          mobile_number,
          city,
          area,
          available_slots,
          cuisines,
          is_non_vegetarian,
          photo_url,
        },
      ])
      .select();

    if (error) {
      // Handle duplicate from DB unique constraint as fallback
      if (error.message?.toLowerCase().includes("duplicate")) {
        return NextResponse.json(
          {
            success: false,
            error: "This mobile number is already registered",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cook saved successfully",
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid form submission",
      },
      { status: 400 }
    );
  }
}
