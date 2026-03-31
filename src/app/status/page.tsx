"use client";

import { useState, useEffect } from "react";
import { getCurrentWeekDays } from "@/lib/utils";
import Link from "next/link";

const ALL_SLOTS = [
  { time: "10:00~12:00", isWeekendOnly: true },
  { time: "12:00~14:00", isWeekendOnly: true },
  { time: "14:00~16:00", isWeekendOnly: true },
  { time: "16:00~18:00", isWeekendOnly: false },
  { time: "18:00~20:00", isWeekendOnly: false },
  { time: "20:00~22:00", isWeekendOnly: false },
];

export default function StatusPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [currentWeekDays, setCurrentWeekDays] = useState<any[]>([]);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelPassword, setCancelPassword] = useState("");

  useEffect(() => {
    setCurrentWeekDays(getCurrentWeekDays());
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    // 필터 없이 모든 데이터를 가져온 후 프론트에서 처리하는 게 가장 확실합니다.
    const res = await fetch("/api/reservations");
    if (res.ok) {
      const data = await res.json();
      setReservations(data);
    }
  };

  // 날짜와 시간, 구장 타입이 모두 일치하는지 확인
  const getReservation = (date: string, time: string) => {
    return reservations.find(
      (r) =>
        r.reservation_date === date &&
        r.time_slot === time &&
        (r.field_type === "B" || r.field_type === "b"), // 대소문자 방어 코드
    );
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelId || !cancelPassword) return;
    const res = await fetch("/api/reservations/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cancelId, password: cancelPassword }),
    });
    if (res.ok) {
      alert("취소되었습니다.");
      setCancelId(null);
      setCancelPassword("");
      fetchReservations();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold"
          >
            ← 메인으로
          </Link>
          <h1 className="text-xl font-bold">풋살장 예약 현황</h1>
          <button
            onClick={fetchReservations}
            className="text-blue-600 font-bold"
          >
            새로고침
          </button>
        </div>

        {cancelId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form
              onSubmit={handleCancel}
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm mx-4"
            >
              <h3 className="font-bold mb-4">예약 취소</h3>
              <input
                type="password"
                value={cancelPassword}
                onChange={(e) => setCancelPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full p-3 border rounded-lg mb-4"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCancelId(null)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold"
                >
                  취소하기
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-emerald-600 text-white font-bold text-center">
            B 풋살장
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 border-r min-w-[120px] text-gray-500 text-sm">
                    시간대
                  </th>
                  {currentWeekDays.map((day) => (
                    <th
                      key={day.fullDate}
                      className={`p-3 border-r text-sm font-bold ${day.isWeekend ? "text-red-500 bg-red-50" : "text-gray-700"}`}
                    >
                      {day.display}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_SLOTS.map((slot) => (
                  <tr key={slot.time} className="border-b">
                    <td className="p-3 border-r font-bold text-xs bg-gray-50 text-gray-400">
                      {slot.time}
                    </td>
                    {currentWeekDays.map((day) => {
                      if (slot.isWeekendOnly && !day.isWeekend) {
                        return (
                          <td
                            key={day.fullDate}
                            className="p-2 border-r bg-gray-100/30 text-gray-200 text-[10px]"
                          >
                            운영 안함
                          </td>
                        );
                      }
                      const res = getReservation(day.fullDate, slot.time);
                      return (
                        <td
                          key={day.fullDate}
                          className="p-2 border-r align-top h-24"
                        >
                          {res ? (
                            <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg h-full flex flex-col justify-center shadow-sm">
                              {/* 바뀐 DB 컬럼명 적용: club_name, user_name */}
                              <span className="font-bold text-emerald-900 text-xs break-all leading-tight">
                                {res.club_name}
                              </span>
                              <span className="text-gray-600 text-[10px] mt-1">
                                {res.user_name}
                              </span>
                              <button
                                onClick={() => setCancelId(res.id)}
                                className="mt-auto text-[9px] text-gray-400 hover:text-red-500 underline"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="text-gray-200 text-[10px] flex items-center justify-center h-full">
                              비어있음
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
