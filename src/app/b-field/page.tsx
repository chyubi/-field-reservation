"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, Reservation } from "@/lib/api";
import { getNextWeekDays } from "@/lib/utils";

// 평일/주말 시간대 분리
const WEEKDAY_SLOTS = ["16:00~18:00", "18:00~20:00", "20:00~22:00"];
const WEEKEND_SLOTS = [
  "10:00~12:00",
  "12:00~14:00",
  "14:00~16:00",
  "16:00~18:00",
  "18:00~20:00",
  "20:00~22:00",
];
const FIELD_TYPE = "B";

export default function AFieldReservation() {
  const router = useRouter();
  const [availableDays, setAvailableDays] = useState<any[]>([]);
  const [reservedSlots, setReservedSlots] = useState<Reservation[]>([]);

  const [selectedDayObj, setSelectedDayObj] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState("");

  const [formData, setFormData] = useState({
    userName: "",
    clubName: "",
    contact: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAvailableDays(getNextWeekDays());
    void fetchReservedSlots();
  }, []);

  const fetchReservedSlots = async () => {
    try {
      const data = await apiRequest<Reservation[]>(
        `/api/v1/reservations?fieldType=${FIELD_TYPE}&week=next`,
      );
      setReservedSlots(data);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "예약 현황을 불러오지 못했습니다.",
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedDayObj ||
      !selectedTime ||
      !formData.userName ||
      !formData.clubName ||
      !formData.contact ||
      !formData.password
    )
      return;

    setIsSubmitting(true);
    try {
      await apiRequest<Reservation>("/api/v1/reservations", {
        method: "POST",
        body: JSON.stringify({
          fieldType: FIELD_TYPE,
          reservationDate: selectedDayObj.fullDate,
          timeSlot: selectedTime,
          userName: formData.userName,
          clubName: formData.clubName,
          contact: formData.contact,
          password: formData.password,
        }),
      });

      alert("예약이 완료되었습니다! 🎉");
      router.push("/status");
    } catch (error) {
      alert(error instanceof Error ? error.message : "서버 오류가 발생했습니다.");
      void fetchReservedSlots();
      setSelectedTime("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBooked = (date: string, time: string) => {
    return reservedSlots.some(
      (slot) => slot.reservationDate === date && slot.timeSlot === time,
    );
  };

  // 선택된 날짜가 주말이면 주말 배열을, 아니면 평일 배열을 렌더링
  const currentSlots = selectedDayObj?.isWeekend
    ? WEEKEND_SLOTS
    : WEEKDAY_SLOTS;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">
          B 풋살장 예약
        </h1>

        <form onSubmit={handleReservation} className="space-y-8">
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3">
              1. 요일 선택
            </h2>
            {/* 7일 표시를 위해 cols-4 나 cols-7 사용 */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableDays.map((day) => (
                <button
                  key={day.fullDate}
                  type="button"
                  onClick={() => {
                    setSelectedDayObj(day);
                    setSelectedTime("");
                  }}
                  className={`p-3 rounded-lg border font-medium text-sm transition-all ${
                    selectedDayObj?.fullDate === day.fullDate
                      ? "bg-blue-600 text-white border-blue-600"
                      : day.isWeekend
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-white text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  {day.display}
                </button>
              ))}
            </div>
          </div>

          {selectedDayObj && (
            <div>
              <h2 className="text-base font-bold text-gray-700 mb-3">
                2. 시간 선택 {selectedDayObj.isWeekend && "(주말)"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentSlots.map((time) => {
                  const booked = isBooked(selectedDayObj.fullDate, time);
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
                placeholder="예약 취소용 비밀번호"
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
