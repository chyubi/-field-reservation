"use client";

import { useState, useEffect } from "react";
import { getNextWeekDays } from "@/lib/utils";
import Link from "next/link";

// 달력 Y축에 출력될 전체 타임슬롯 정의
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
  const [availableDays, setAvailableDays] = useState<any[]>([]);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelPassword, setCancelPassword] = useState("");

  useEffect(() => {
    setAvailableDays(getNextWeekDays());
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const res = await fetch("/api/reservations");
    if (res.ok) {
      const data = await res.json();
      setReservations(data);
    }
  };

  const getReservation = (fieldType: string, date: string, time: string) => {
    return reservations.find(
      (r) =>
        r.field_type === fieldType &&
        r.reservation_date === date &&
        r.time_slot === time,
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
      alert("예약이 정상적으로 취소되었습니다.");
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
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300"
            >
              ← 메인으로
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              이번 주 예약 현황 📅
            </h1>
          </div>
          <button
            onClick={fetchReservations}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold"
          >
            새로고침
          </button>
        </div>

        {cancelId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
              onSubmit={handleCancel}
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm mx-4"
            >
              <h3 className="font-bold text-lg mb-4">예약 취소</h3>
              <p className="text-sm text-gray-600 mb-4">
                예약 시 설정한 비밀번호를 입력해주세요.
              </p>
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
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg"
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

        {["A", "B"].map((field) => (
          <div
            key={field}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12"
          >
            <div
              className={`p-4 text-white font-bold text-lg ${field === "A" ? "bg-blue-600" : "bg-emerald-600"}`}
            >
              {field === "A" ? "A 대운동장" : "B 풋살장"}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 border-r min-w-[120px] text-gray-600 font-bold">
                      시간대
                    </th>
                    {availableDays.map((day) => (
                      <th
                        key={day.fullDate}
                        className={`p-3 border-r font-bold ${day.isWeekend ? "text-red-500 bg-red-50" : "text-gray-700"}`}
                      >
                        {day.display}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_SLOTS.map((slot) => (
                    <tr key={slot.time} className="border-b">
                      <td className="p-3 border-r font-bold text-sm bg-gray-50 text-gray-600">
                        {slot.time}
                      </td>
                      {availableDays.map((day) => {
                        // 평일인데 주말 전용 오전 시간대인 경우 회색 블록 처리
                        if (slot.isWeekendOnly && !day.isWeekend) {
                          return (
                            <td
                              key={day.fullDate}
                              className="p-2 border-r bg-gray-100/50 text-gray-300 text-xs"
                            >
                              운영 안함
                            </td>
                          );
                        }

                        const res = getReservation(
                          field,
                          day.fullDate,
                          slot.time,
                        );
                        return (
                          <td
                            key={day.fullDate}
                            className="p-2 border-r align-top"
                          >
                            {res ? (
                              <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg flex flex-col items-center">
                                <span className="font-bold text-blue-800 text-sm">
                                  {res.club_name}
                                </span>
                                <span className="text-gray-600 text-xs mt-1">
                                  {res.user_name}
                                </span>
                                <button
                                  onClick={() => setCancelId(res.id)}
                                  className="mt-2 text-[10px] text-gray-400 hover:text-red-500 underline"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <div className="text-gray-300 text-xs py-2">
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
        ))}
      </div>
    </div>
  );
}
