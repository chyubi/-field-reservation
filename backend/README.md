# Backend

## Run

```bash
mvn spring-boot:run
```

## Required env

```env
DB_URL=jdbc:postgresql://localhost:5432/field_reservation
DB_USERNAME=postgres
DB_PASSWORD=postgres
FRONTEND_ORIGIN=http://localhost:3000
ADMIN_TOKEN=change-me-admin-token
ADMIN_PASSWORD_HASH=<bcrypt-hash>
```

## Notes

- `app.allowed-clubs` 는 `/Users/nohseunghyeok/Downloads/reservations_rows.csv` 의 `club_name` 기준으로 채워두었다.
- `ㅏㅏㅏ`, `asdf`, 임의 문자열은 allowlist 에 없으면 서버에서 거절된다.
- 예약 가능 시간은 서버가 `일요일 20:00~22:00` 기준으로 강제한다.
