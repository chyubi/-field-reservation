"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNextWeekDays } from "@/lib/utils";

// 카톡 공지사항에 맞춘 평일 타임슬롯
const TIME_SLOTS = [
  "16:00~18:00 (0번)",
  "18:00~20:00 (1번)",
  "20:00~22:00 (2번)",
];
const FIELD_TYPE = "A";

export default function AFieldReservation() {
  const router = useRouter();
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [reservedSlots, setReservedSlots] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    userName: "",
    clubName: "",
    contact: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAvailableDays(getNextWeekDays());
    fetchReservedSlots();
  }, []);

  const fetchReservedSlots = async () => {
    const res = await fetch(`/api/reservations?fieldType=${FIELD_TYPE}`);
    if (res.ok) {
      const data = await res.json();
      setReservedSlots(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedDate ||
      !selectedTime ||
      !formData.userName ||
      !formData.clubName ||
      !formData.contact ||
      !formData.password
    )
      return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_type: FIELD_TYPE,
          reservation_date: selectedDate,
          time_slot: selectedTime,
          user_name: formData.userName,
          club_name: formData.clubName,
          contact: formData.contact,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("예약이 완료되었습니다! 🎉");
        router.push("/status"); // 예약 완료 후 현황(달력) 페이지로 이동
      } else {
        alert(data.error);
        fetchReservedSlots();
        setSelectedTime("");
      }
    } catch (error) {
      alert("서버 통신 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              1. 요일 선택
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
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  {date.substring(5)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 시간 선택 */}
          {selectedDate && (
            <div>
              <h2 className="text-base font-bold text-gray-700 mb-3">
                2. 시간 선택
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                          : selectedTime === time
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 hover:border-blue-500"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. 예약자 정보 입력 (칸 4개로 분리) */}
          {selectedTime && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-700 mb-3">
                3. 예약 정보 입력
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="clubName"
                  placeholder="동아리명"
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="userName"
                  placeholder="예약자 이름"
                  onChange={handleChange}
                  required
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="text"
                name="contact"
                placeholder="연락처 (010-XXXX-XXXX)"
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                name="password"
                placeholder="예약 취소용 비밀번호 (기억해주세요!)"
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedTime || isSubmitting}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-lg disabled:bg-gray-300 mt-8"
          >
            {isSubmitting ? "예약 처리 중..." : "예약 확정하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
