"use client";

import { useState, useEffect } from "react";
import { getNextWeekDays } from "@/lib/utils";

export default function StatusPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
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

  // 특정 구장, 날짜, 시간의 예약 정보 찾기
  const getReservation = (fieldType: string, date: string, time: string) => {
    return reservations.find(
      (r) =>
        r.field_type === fieldType &&
        r.reservation_date === date &&
        r.time_slot === time,
    );
  };

  // 예약 취소 실행 함수
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
      fetchReservations(); // 현황판 새로고침
    } else {
      const data = await res.json();
      alert(data.error); // 비밀번호 틀림 등 에러 출력
    }
  };

  const TIME_SLOTS = [
    "16:00~18:00 (0번)",
    "18:00~20:00 (1번)",
    "20:00~22:00 (2번)",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            이번 주 운동장 예약 현황 📅
          </h1>
          <button
            onClick={fetchReservations}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold"
          >
            새로고침
          </button>
        </div>

        {/* 취소 모달창 (cancelId가 있을 때만 표시) */}
        {cancelId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
              onSubmit={handleCancel}
              className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm"
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
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8"
          >
            <div
              className={`p-4 text-white font-bold text-lg ${field === "A" ? "bg-blue-600" : "bg-emerald-600"}`}
            >
              {field === "A" ? "A 대운동장" : "B 풋살장"}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 border-r min-w-[120px]">시간대</th>
                    {availableDays.map((date) => (
                      <th key={date} className="p-3 border-r">
                        {date.substring(5)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => (
                    <tr key={time} className="border-b">
                      <td className="p-3 border-r font-bold text-sm bg-gray-50">
                        {time}
                      </td>
                      {availableDays.map((date) => {
                        const res = getReservation(field, date, time);
                        return (
                          <td key={date} className="p-2 border-r text-sm">
                            {res ? (
                              <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg flex flex-col items-center">
                                <span className="font-bold text-blue-800">
                                  {res.club_name}
                                </span>
                                <span className="text-gray-600 text-xs">
                                  {res.user_name}
                                </span>
                                <button
                                  onClick={() => setCancelId(res.id)}
                                  className="mt-2 text-xs text-red-500 underline hover:text-red-700"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400">비어있음</span>
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
