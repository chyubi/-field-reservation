import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// [GET] 예약된 내역 불러오기 (프론트에서 이미 예약된 시간 비활성화할 때 사용)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldType = searchParams.get("fieldType"); // 'A' 또는 'B'

  if (!fieldType) {
    return NextResponse.json(
      { error: "구장 타입이 필요합니다." },
      { status: 400 },
    );
  }

  // Supabase에서 해당 구장의 예약 내역 긁어오기
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("field_type", fieldType);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// [POST] 새로운 예약 생성 (사용자가 예약 버튼을 눌렀을 때)
export async function POST(request: Request) {
  const body = await request.json();
  const { field_type, reservation_date, time_slot, user_info } = body;

  // DB에 데이터 삽입 시도
  const { data, error } = await supabase
    .from("reservations")
    .insert([{ field_type, reservation_date, time_slot, user_info }])
    .select();

  // ★ 에러 처리: 동시성 방어!
  if (error) {
    // Postgres 고유 위반 에러 코드 (23505) = 이미 같은 구장/날짜/시간에 데이터가 있음
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "이미 다른 분이 예약한 시간입니다. 😭" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
