# Field Reservation Frontend

동아리 풋살장 예약 서비스를 위한 `Next.js` 프론트엔드 프로젝트다.

이 저장소는 화면 렌더링과 사용자 상호작용만 담당한다.  
예약 생성, 예약 조회, 예약 취소, 관리자 인증 같은 실제 비즈니스 로직은 별도 백엔드 API가 처리한다.

## 프로젝트 개요

- 홈 화면에서 현재 예약 가능 상태를 보여준다.
- 예약 페이지에서 날짜, 시간, 예약자 정보를 입력받아 백엔드에 전달한다.
- 현황판 페이지에서 현재 예약 상태를 조회한다.
- 관리자 페이지에서 로그인 후 예약 목록을 확인하고 삭제할 수 있다.

## 기술 스택

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`

## 디렉터리 구조

```text
src/
  app/
    page.tsx          # 홈
    b-field/page.tsx  # 예약 페이지
    status/page.tsx   # 예약 현황판
    admin/page.tsx    # 관리자 페이지
  components/
  lib/
    api.ts            # 외부 백엔드 API 호출
    utils.ts          # 날짜/표시용 유틸
public/
```

## 동작 방식

프론트는 내부 API 라우트를 사용하지 않고, 환경변수로 받은 외부 백엔드 주소만 호출한다.

- 예약 가능 여부 조회: `GET /api/v1/reservation-policy`
- 예약 현황 조회: `GET /api/v1/reservations`
- 예약 생성: `POST /api/v1/reservations`
- 예약 취소: `POST /api/v1/reservations/{id}/cancel`
- 관리자 로그인: `POST /api/v1/admin/login`
- 관리자 예약 조회/삭제: `GET`, `DELETE /api/v1/admin/reservations`

API 호출 공통 로직은 [src/lib/api.ts](/Users/nohseunghyeok/Desktop/대외활동/-field-reservation/src/lib/api.ts)에 있다.

## 환경변수

필수 환경변수:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain
```

현재 배포용 설정은 [.env.production](/Users/nohseunghyeok/Desktop/대외활동/-field-reservation/.env.production)에 들어 있다.

예시:

```bash
NEXT_PUBLIC_API_BASE_URL=https://13-53-87-28.sslip.io
```

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## 배포

이 프로젝트는 프론트만 배포한다.  
배포 환경에서는 `NEXT_PUBLIC_API_BASE_URL` 이 실제 백엔드 HTTPS 주소를 가리켜야 한다.

루트 기준으로 빌드되는 환경을 가정한다.

```bash
npm run build
npm run start
```

## 주의사항

- 이 저장소에는 백엔드 코드가 포함되지 않는다.
- 백엔드 주소가 바뀌면 `.env.production` 또는 배포 환경변수를 함께 갱신해야 한다.
- 브라우저에서 호출하므로 운영 환경에서는 반드시 `HTTPS` 백엔드 주소를 사용해야 한다.
