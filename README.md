# Blog Website (Docker Dev)

Repo này gồm 2 phần:
- `frontend/`: Vite + React
- `server/`: Express + Prisma (Postgres) + Redis

## Chạy cho dev khác (cách khuyến nghị)

Yêu cầu: cài Docker Desktop (Linux containers) và có `docker compose`.

1. Clone repo.
2. Tạo file env (nếu cần):
   - `server/.env`: copy từ `server/.env.example` rồi điền giá trị (ít nhất `ACCESS_TOKEN_SECRET` nếu bạn muốn override).
   - `frontend/.env`: copy từ `frontend/.env.example` rồi điền Firebase web config (nếu dùng Google sign-in).
3. Chạy:
   ```bash
   docker compose up --build
   ```
4. Truy cập:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080

Migrations Prisma sẽ tự chạy khi `server` start (`prisma migrate deploy`).

## Firebase Admin (backend)

Mặc định docker-compose để `FIREBASE_DISABLED=true` để tránh thiếu `serviceAccountKey.json`.

Nếu bạn cần Google auth ở backend:
- Đặt `FIREBASE_DISABLED=false`
- Cung cấp `server/serviceAccountKey.json` (bind-mount qua volume mặc định đã mount `./server:/app`), hoặc set `FIREBASE_SERVICE_ACCOUNT_JSON` / `FIREBASE_SERVICE_ACCOUNT_PATH`.

## Reset dữ liệu DB/Redis

```bash
docker compose down -v
```

