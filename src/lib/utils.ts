import { startOfWeek, addWeeks, format, startOfToday } from "date-fns";
import { ko } from "date-fns/locale";

// 1. 예약 락 (테스트를 위해 상시 오픈 유지)
export function isReservationUnlocked(): boolean {
  return true;
}

// 공통 날짜 배열 생성 함수
function getWeekDays(startDate: Date) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push({
      fullDate: format(date, "yyyy-MM-dd"),
      display: format(date, "MM/dd(EE)", { locale: ko }), // 간격 줄이기 위해 띄어쓰기 제거
      isWeekend: i >= 5,
    });
  }
  return days;
}

// 2. 이번 주 월~일 (오늘이 포함된 주)
export function getCurrentWeekDays() {
  const today = startOfToday();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  return getWeekDays(start);
}

// 3. 다음 주 월~일 (오늘 기준 다음 주)
export function getNextWeekDays() {
  const today = startOfToday();
  const start = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
  return getWeekDays(start);
}
