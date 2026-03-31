"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);

  // 관리자 접속 시 자동으로 데이터 불러오기
  useEffect(() => {
    if (isAuthenticated) fetchReservations();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin1234") {
      setIsAuthenticated(true);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const fetchReservations = async () => {
    const res = await fetch("/api/admin");
    if (res.ok) {
      const data = await res.json();
      setReservations(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 예약을 삭제하시겠습니까? (복구 불가)")) return;

    const res = await fetch(`/api/admin?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("성공적으로 삭제되었습니다.");
      fetchReservations();
    } else {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
                  <th className="p-4 font-semibold whitespace-nowrap">구장</th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    예약 날짜
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">시간</th>
                  {/* 이름이 변경된 헤더 */}
                  <th className="p-4 font-semibold">
                    동아리 / 예약자 / 연락처
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    예약 접수 시간
                  </th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">
                    관리
                  </th>
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
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${res.field_type === "A" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                        >
                          {res.field_type === "A" ? "A 대운동장" : "B 풋살장"}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-800 whitespace-nowrap">
                        {res.reservation_date}
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {res.time_slot}
                      </td>
                      {/* DB에서 분리된 3개의 데이터를 보여주도록 수정된 부분 */}
                      <td className="p-4">
                        <div className="font-bold text-gray-800">
                          {res.club_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {res.user_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {res.contact}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(res.created_at).toLocaleString("ko-KR")}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-semibold whitespace-nowrap"
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
