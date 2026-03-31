import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { id, password } = await request.json();

  // 1. 해당 예약의 비밀번호 확인
  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select("password")
    .eq("id", id)
    .single();

  if (fetchError || !reservation) {
    return NextResponse.json(
      { error: "예약을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  // 2. 비밀번호 일치 여부 확인
  if (reservation.password !== password) {
    return NextResponse.json(
      { error: "비밀번호가 일치하지 않습니다." },
      { status: 401 },
    );
  }

  // 3. 일치하면 삭제 진행
  const { error: deleteError } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id);

  if (deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
