"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isReservationUnlocked } from "@/lib/utils";
import {
  setDay,
  setHours,
  setMinutes,
  setSeconds,
  differenceInSeconds,
} from "date-fns";

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const checkTime = () => {
      if (isReservationUnlocked()) {
        setUnlocked(true);
        setCountdown("");
      } else {
        setUnlocked(false);
        // 다음 오픈 시간(일요일 21시) 계산
        const now = new Date();
        let nextSunday = setSeconds(
          setMinutes(setHours(setDay(now, 0), 21), 0),
          0,
        );
        if (now > nextSunday) {
          nextSunday.setDate(nextSunday.getDate() + 7);
        }
        const diff = Math.max(0, differenceInSeconds(nextSunday, now));
        const days = Math.floor(diff / (3600 * 24));
        const hours = Math.floor((diff % (3600 * 24)) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setCountdown(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초 남음`);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        대학교 운동장 예약 시스템
      </h1>

      {!unlocked ? (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md border border-gray-100">
          <h2 className="text-xl text-red-500 font-bold mb-3">
            예약 오픈 전입니다 🔒
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            매주 일요일 21:00에 다음 주 예약이 오픈됩니다.
          </p>
          <div className="text-2xl font-mono font-bold bg-gray-100 text-gray-800 p-4 rounded-lg">
            {countdown}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md grid gap-5">
          <div className="text-center mb-2">
            <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-bold text-sm animate-pulse border border-green-200">
              현재 예약 오픈 중! 🔓
            </span>
          </div>
          <Link
            href="/a-field"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 rounded-xl shadow-md transition-colors"
          >
            A 대운동장 예약하기
          </Link>
          <Link
            href="/b-field"
            className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-5 rounded-xl shadow-md transition-colors"
          >
            B 풋살장 예약하기
          </Link>
        </div>
      )}
    </div>
  );
}
