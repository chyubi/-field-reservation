import {
  isAfter,
  isBefore,
  setDay,
  setHours,
  setMinutes,
  setSeconds,
  startOfWeek,
  addWeeks,
  format,
} from "date-fns";
import { ko } from "date-fns/locale"; // 한국어 요일 지원

// 1. 일요일 20:00 ~ 22:00 사이인지 체크 (락 해제 조건)
export function isReservationUnlocked(): boolean {
  const now = new Date();

  // 이번 주 일요일(0) 20:00:00 및 22:00:00 세팅
  const sunday20 = setSeconds(setMinutes(setHours(setDay(now, 0), 20), 0), 0);
  const sunday22 = setSeconds(setMinutes(setHours(setDay(now, 0), 22), 0), 0);

  return isAfter(now, sunday20) && isBefore(now, sunday22);
}

// 2. 다음 주 월~일 (7일) 날짜 배열 생성
export function getNextWeekDays() {
  const now = new Date();
  // 다음 주 월요일 구하기
  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(nextWeekStart);
    date.setDate(date.getDate() + i);
    days.push({
      fullDate: format(date, "yyyy-MM-dd"), // DB 저장용 (예: 2026-04-06)
      display: format(date, "MM/dd (EE)", { locale: ko }), // 화면 표시용 (예: 04/06 (월))
      isWeekend: i >= 5, // 토(5), 일(6) 판별
    });
  }
  return days;
}
