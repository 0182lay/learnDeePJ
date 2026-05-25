# LearnDeepJ

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap");

body,
body * {
  font-family: "Noto Sans Lao", "Phetsarath OT", "Saysettha OT", sans-serif;
}
</style>

LearnDeepJ ແມ່ນໂປຣເຈັກ demo ເວັບຮຽນອອນລາຍ ສ້າງດ້ວຍ Vue, Vite, TypeScript, Express, Prisma ແລະ MariaDB.

## ຟີເຈີຫຼັກ

- ລະບົບ auth ແລະ role: student, instructor, admin
- ໜ້າລາຍການຄອສ, filter ຕາມ category ແລະໜ້າລາຍລະອຽດຄອສ
- ລະບົບ enrollment ແລະການອະນຸມັດ payment slip ແບບ demo
- student dashboard ທີ່ມີ learning progress ແລະ certificate
- instructor ສາມາດສ້າງ, ແກ້ໄຂ, publish ແລະລຶບຄອສ
- admin ຈັດການ users, courses, categories, payments ແລະ instructor requests
- ບົດຮຽນທີ່ຮອງຮັບ video/document upload
- ລະບົບ quiz ແລະການສ້າງ certificate
- ລະບົບ review ຄອສ ແລະຄຳນວນ rating average ຈິງ

## ສິ່ງທີ່ຕ້ອງມີ

- Node.js 20.19+ ຫຼື 22.12+
- npm
- Docker Desktop
- Git

## 1. ເປີດ Database

ຢູ່ທີ່ project root:

```bash
docker compose up -d
```

ຄຳສັ່ງນີ້ຈະເປີດ MariaDB ທີ່ port `3309`.

ຖ້າ port `3309` ຖືກໃຊ້ຢູ່ແລ້ວ ໃຫ້ປິດ MySQL/MariaDB service ອື່ນກ່ອນ ຫຼືປ່ຽນ port ໃນ `docker-compose.yml` ແລະ `server/.env`.

## 2. ຕັ້ງຄ່າ Server

ສ້າງໄຟລ໌ `server/.env`:

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

ຕິດຕັ້ງ dependencies ແລະ sync database:

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

## 3. ຕັ້ງຄ່າ Client

ເປີດ terminal ອີກອັນ:

```bash
cd client
npm install
npm run dev
```

Client URL:

```text
http://localhost:5173
```

## ຄຳສັ່ງທີ່ໃຊ້ບ່ອຍ

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

1. Register student account.
2. Login ເປັນ student.
3. ເປີດ course catalog ແລະ enroll ຄອສ.
4. upload payment slip ຖ້າຄອສມີລາຄາ.
5. Login ເປັນ admin ແລະ approve payment.
6. student ເຂົ້າ dashboard ແລະເລີ່ມຮຽນ.
7. ຮຽນບົດຮຽນ ແລະເຮັດ quiz ໃຫ້ສຳເລັດ.
8. Generate certificate.
9. Submit course review.
10. Request instructor role.
11. Admin approve instructor request.
12. Instructor ສ້າງ, publish, ແກ້ໄຂ ແລະລຶບຄອສ.

ໃຊ້ [docs/e2e-checklist.md](docs/e2e-checklist.md) ເພື່ອທົດສອບ flow ທັງໝົດກ່ອນ present.
