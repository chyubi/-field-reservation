import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldType = searchParams.get("fieldType");

  let query = supabase
    .from("reservations")
    .select(
      "id, field_type, reservation_date, time_slot, user_name, club_name",
    );
  if (fieldType) {
    query = query.eq("field_type", fieldType);
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    field_type,
    reservation_date,
    time_slot,
    user_name,
    club_name,
    contact,
    password,
  } = body;

  const { data, error } = await supabase
    .from("reservations")
    .insert([
      {
        field_type,
        reservation_date,
        time_slot,
        user_name,
        club_name,
        contact,
        password,
      },
    ])
    .select();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json(
        { error: "이미 예약된 시간입니다." },
        { status: 409 },
      );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
