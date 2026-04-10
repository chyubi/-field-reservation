"use client";

import { useState, useEffect } from "react";
import { apiRequest, Reservation } from "@/lib/api";
import { getCurrentWeekDays, getNextWeekDays } from "@/lib/utils";
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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [viewMode, setViewMode] = useState<"current" | "next">("current");
  const [days, setDays] = useState<any[]>([]);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelPassword, setCancelPassword] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setDays(viewMode === "current" ? getCurrentWeekDays() : getNextWeekDays());
    void fetchReservations();
  }, [viewMode]);

  const fetchReservations = async () => {
    try {
      const data = await apiRequest<Reservation[]>(
        `/api/v1/reservations?fieldType=B&week=${viewMode}`,
      );
      setReservations(data);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "예약 현황을 불러오지 못했습니다.",
      );
    }
  };

  const getReservation = (date: string, time: string) => {
    return reservations.find(
      (r) =>
        r.reservationDate === date &&
        r.timeSlot === time &&
        r.fieldType === "B",
    );
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelId || !cancelPassword) return;

    setIsCancelling(true);
    try {
      await apiRequest<null>(`/api/v1/reservations/${cancelId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ password: cancelPassword }),
      });
      alert("예약이 취소되었습니다.");
      setCancelId(null);
      setCancelPassword("");
      void fetchReservations();
    } catch (error) {
      alert(error instanceof Error ? error.message : "예약 취소에 실패했습니다.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-6 text-sm">
      <div className="max-w-[1000px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="flex justify-between items-center mb-4 px-2">
          <Link href="/" className="text-gray-500 font-bold">
            ← 홈
          </Link>
          <h1 className="text-lg font-black text-gray-800">풋살장 예약 현황</h1>
          <button
            onClick={fetchReservations}
            className="text-blue-500 text-xs font-bold"
          >
            새로고침
          </button>
        </div>

        {/* 이번 주/다음 주 탭 버튼 */}
        <div className="flex gap-1 mb-4 px-2">
          <button
            onClick={() => setViewMode("current")}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${viewMode === "current" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-gray-400 border border-gray-200"}`}
          >
            이번 주 보기
          </button>
          <button
            onClick={() => setViewMode("next")}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${viewMode === "next" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-gray-400 border border-gray-200"}`}
          >
            다음 주 보기
          </button>
        </div>

        {/* 달력 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b text-[11px] text-gray-500">
                  <th className="p-2 border-r w-20">시간</th>
                  {days.map((day) => (
                    <th
                      key={day.fullDate}
                      className={`p-2 border-r ${day.isWeekend ? "text-red-500 bg-red-50/50" : "text-gray-700"}`}
                    >
                      {day.display}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_SLOTS.map((slot) => (
                  <tr key={slot.time} className="border-b last:border-0">
                    <td className="p-2 border-r font-medium text-[10px] bg-gray-50 text-gray-400 leading-tight">
                      {slot.time.split("~")[0]}
                      <br />~{slot.time.split("~")[1]}
                    </td>
                    {days.map((day) => {
                      if (slot.isWeekendOnly && !day.isWeekend) {
                        return (
                          <td
                            key={day.fullDate}
                            className="p-1 border-r bg-gray-50/50"
                          ></td>
                        );
                      }
                      const res = getReservation(day.fullDate, slot.time);
                      return (
                        <td
                          key={day.fullDate}
                          className="p-1 border-r align-top h-20"
                        >
                          {res ? (
                            <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-md h-full flex flex-col justify-center items-center gap-0.5 shadow-sm">
                              <span className="font-black text-emerald-900 text-[11px] truncate w-full">
                                {res.clubName}
                              </span>
                              <span className="text-gray-500 text-[9px]">
                                {res.userName}
                              </span>
                              <button
                                onClick={() => setCancelId(res.id)}
                                className="text-[9px] text-gray-300 mt-1 hover:text-red-400"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <div className="text-gray-100 text-[9px] mt-2 italic">
                              empty
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

      {/* 취소 모달 (생략 가능, 기존과 동일) */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCancel}
            className="bg-white p-6 rounded-2xl w-full max-w-xs shadow-2xl"
          >
            <h3 className="font-black text-center mb-4">예약 취소 보안인증</h3>
            <input
              type="password"
              value={cancelPassword}
              onChange={(e) => setCancelPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full p-3 border rounded-xl mb-4 bg-gray-50"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCancelId(null)}
                className="flex-1 text-gray-400 font-bold"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isCancelling}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold"
              >
                {isCancelling ? "취소 중..." : "즉시취소"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
