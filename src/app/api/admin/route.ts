import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// [GET] 관리자용 전체 예약 내역 조회 (날짜 및 시간순 정렬)
export async function GET() {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("reservation_date", { ascending: true })
    .order("time_slot", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// [DELETE] 예약 강제 삭제
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json(
      { error: "삭제할 예약 ID가 필요합니다." },
      { status: 400 },
    );

  const { error } = await supabase.from("reservations").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
