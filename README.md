# LearnDeepJ

LearnDeepJ is an online learning demo project built with Vue, Vite, TypeScript, Express, Prisma, and MariaDB.

## Main Features

- Auth and roles: student, instructor, admin
- Course catalog with category filter and course detail page
- Enrollment and demo payment slip approval
- Student dashboard with learning progress and certificates
- Instructor course creation, edit, publish, and delete
- Admin management for users, courses, categories, payments, and instructor requests
- Lessons with video/document upload
- Quiz flow and certificate generation
- Course reviews with real rating average

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Docker Desktop
- Git

## 1. Start Database

From the project root:

```bash
docker compose up -d
```

This starts MariaDB on port `3309`.

If port `3309` is already used on your machine, stop the other MySQL/MariaDB service first or change the port in `docker-compose.yml` and `server/.env`.

## 2. Server Setup

Create `server/.env`:

```env
PORT=3003
JWT_SECRET=laysky_secret_key
DATABASE_URL="mysql://root:lay123@127.0.0.1:3309/learndee"
DATABASE_USER="root"
DATABASE_PASSWORD="lay123"
DATABASE_NAME="learndee"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3309
```

Install dependencies and sync the database:

```bash
cd server
npm install
npx prisma db push
npx prisma generate
npm run seed:categories
npm run seed:demo-users
npm run dev
```

Server URL:

```text
http://localhost:3003
```

## 3. Client Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Client URL:

```text
http://localhost:5173
```

## Useful Commands

Server:

```bash
cd server
npx tsc --noEmit
npx prisma db push
npx prisma generate
npm run dev
```

Client:

```bash
cd client
npm run type-check
npm run lint
npm run dev
```

## Demo Flow

1. Register a student account.
2. Login as student.
3. Open course catalog and enroll in a course.
4. Upload a payment slip if the course has a price.
5. Login as admin and approve the payment.
6. Student opens dashboard and starts learning.
7. Complete lessons and quiz.
8. Generate certificate.
9. Submit a course review.
10. Request instructor role.
11. Admin approves instructor request.
12. Instructor creates, publishes, edits, and deletes courses.

Use [docs/e2e-checklist.md](docs/e2e-checklist.md) to test the full flow before presenting.

