"use client";

import { useState } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);

  // 관리자 로그인 처리 (심플하게 하드코딩된 비밀번호 사용)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin1234") {
      // 관리자 비밀번호 (원하시는 대로 변경하세요)
      setIsAuthenticated(true);
      fetchReservations();
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  // 전체 예약 데이터 불러오기
  const fetchReservations = async () => {
    const res = await fetch("/api/admin");
    if (res.ok) {
      const data = await res.json();
      setReservations(data);
    }
  };

  // 예약 삭제 함수
  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 예약을 삭제하시겠습니까? (복구 불가)")) return;

    const res = await fetch(`/api/admin?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("성공적으로 삭제되었습니다.");
      fetchReservations(); // 삭제 후 리스트 새로고침
    } else {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 1) 로그인 전 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            관리자 로그인
          </h1>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors"
          >
            접속하기
          </button>
        </form>
      </div>
    );
  }

  // 2) 로그인 후 관리자 대시보드 화면
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            예약 관리 대시보드
          </h1>
          <button
            onClick={fetchReservations}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200"
          >
            새로고침
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">구장</th>
                  <th className="p-4 font-semibold">예약 날짜</th>
                  <th className="p-4 font-semibold">시간</th>
                  <th className="p-4 font-semibold">예약자 정보</th>
                  <th className="p-4 font-semibold">예약 접수 시간</th>
                  <th className="p-4 font-semibold text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      예약 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${res.field_type === "A" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                        >
                          {res.field_type === "A" ? "A 대운동장" : "B 풋살장"}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {res.reservation_date}
                      </td>
                      <td className="p-4 text-gray-600">{res.time_slot}</td>
                      <td className="p-4 font-medium">{res.user_info}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(res.created_at).toLocaleString("ko-KR")}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-semibold"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
