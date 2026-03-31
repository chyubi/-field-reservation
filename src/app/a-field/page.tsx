"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNextWeekDays } from "@/lib/utils";

// 운동장 사용 가능 시간대 세팅
const TIME_SLOTS = ["18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"];
const FIELD_TYPE = "A";

export default function AFieldReservation() {
  const router = useRouter();
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [reservedSlots, setReservedSlots] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAvailableDays(getNextWeekDays());
    fetchReservedSlots();
  }, []);

  // API를 통해 이미 예약된 내역 가져오기
  const fetchReservedSlots = async () => {
    const res = await fetch(`/api/reservations?fieldType=${FIELD_TYPE}`);
    if (res.ok) {
      const data = await res.json();
      setReservedSlots(data);
    }
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !userInfo) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_type: FIELD_TYPE,
          reservation_date: selectedDate,
          time_slot: selectedTime,
          user_info: userInfo,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("예약이 완료되었습니다! 🎉");
        router.push("/");
      } else {
        // 중복 예약 발생 시 (서버에서 튕겨냈을 때)
        alert(data.error);
        fetchReservedSlots(); // 최신 예약 상태로 즉시 갱신
        setSelectedTime(""); // 선택했던 시간 초기화
      }
    } catch (error) {
      alert("서버 통신 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 특정 날짜/시간이 이미 예약되었는지 판별하는 함수
  const isBooked = (date: string, time: string) => {
    return reservedSlots.some(
      (slot) => slot.reservation_date === date && slot.time_slot === time,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">
          A 대운동장 예약
        </h1>

        <form onSubmit={handleReservation} className="space-y-8">
          {/* 1. 날짜 선택 */}
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3">
              1. 다음 주 요일 선택
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {availableDays.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime("");
                  }}
                  className={`p-3 rounded-lg border font-medium text-sm transition-all ${
                    selectedDate === date
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-200"
                  }`}
                >
                  {date.substring(5)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 시간 선택 (날짜를 선택해야 보임) */}
          {selectedDate && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h2 className="text-base font-bold text-gray-700 mb-3">
                2. 시간 선택
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIME_SLOTS.map((time) => {
                  const booked = isBooked(selectedDate, time);
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={booked}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                        booked
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 line-through"
                          : selectedTime === time
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-700 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. 예약자 정보 (시간까지 선택해야 보임) */}
          {selectedTime && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <h2 className="text-base font-bold text-gray-700 mb-3">
                3. 예약자 정보
              </h2>
              <input
                type="text"
                placeholder="이름 (학번 또는 연락처)"
                value={userInfo}
                onChange={(e) => setUserInfo(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!selectedTime || !userInfo || isSubmitting}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-8 text-lg"
          >
            {isSubmitting ? "예약 처리 중..." : "예약 확정하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
