# LearnDeepJ

LearnDeepJ is an online learning demo project built with Vue, Vite, TypeScript, Express, Prisma, and MariaDB.

## Main Features / ฟีเจอร์หลัก
- **Auth and roles**: student, instructor, admin (ระบบยืนยันตัวตนและบทบาท: นักเรียน, ผู้สอน, ผู้ดูแลระบบ)
- **Course catalog with category filter and course detail page**: (ระบบค้นหาคอร์สเรียน กรองตามหมวดหมู่ และแสดงรายละเอียดคอร์ส)
- **Enrollment and demo payment slip approval**: (การสมัครเรียนและการอนุมัติสลิปชำระเงินจำลอง)
- **Student dashboard with learning progress and certificates**: (แดชบอร์ดนักเรียนเพื่อติดตามความคืบหน้าการเรียนและใบประกาศนียบัตร)
- **Instructor course creation, edit, publish, and delete**: (ระบบจัดการคอร์สสำหรับผู้สอน: สร้าง, แก้ไข, เผยแพร่, ลบ)
- **Admin management for users, courses, categories, payments, and instructor requests**: (ระบบแอดมินสำหรับจัดการผู้ใช้งาน, คอร์ส, หมวดหมู่, สลิปชำระเงิน และคำขอผู้สอน)
- **Lessons with video/document upload**: (บทเรียนที่รองรับการอัปโหลดวิดีโอและเอกสารประกอบ)
- **Quiz flow and certificate generation**: (การทำข้อสอบประเมินผลและการออกใบประกาศนียบัตร)
- **Course reviews with real rating average**: (ระบบรีวิวคอร์สเรียนพร้อมการคำนวณคะแนนเฉลี่ยจริง)

---

## 🇹🇭 คู่มือการติดตั้งภาษาไทย (Thai Installation Guide)

วิธีลงโปรเจกต์นี้ให้สามารถรันบนเครื่องคอมพิวเตอร์ของคุณหรือเพื่อให้ AI ติดตั้งให้:

### สิ่งที่ต้องมีในเครื่องก่อน (Prerequisites)
- **Node.js**: เวอร์ชัน 20.19+ หรือ 22.12+ (แนะนำ LTS)
- **Docker Desktop** (สำหรับรันฐานข้อมูล MariaDB)
- **Git** (สำหรับโคลนโปรเจกต์)

---

### ขั้นตอนที่ 1: เปิดใช้งานฐานข้อมูล (Database Setup)
เปิด Terminal ที่โฟลเดอร์หลักของโปรเจกต์ (Project Root) แล้วรันคำสั่ง:
```bash
docker compose up -d
```
คำสั่งนี้จะทำการดึงและเริ่มการทำงานของ MariaDB บนพอร์ต `3309` ในรูปแบบเบื้องหลัง (Background)
*(หมายเหตุ: หากพอร์ต 3309 ชนกับบริการอื่น ให้หยุดบริการนั้นก่อน หรือแก้ไขพอร์ตใน `docker-compose.yml` และ `server/.env`)*

---

### ขั้นตอนที่ 2: ตั้งค่าฝั่งเซิร์ฟเวอร์ (Server / Backend Setup)
1. เข้าไปที่โฟลเดอร์ `server`:
   ```bash
   cd server
   ```
2. สร้างไฟล์ `.env` โดยการก๊อปปี้จากไฟล์ `.env.example`:
   - ในระบบปฏิบัติการ Windows/macOS/Linux สามารถคัดลอกไฟล์และตั้งชื่อใหม่เป็น `.env` หรือสร้างไฟล์ `server/.env` แล้วคัดลอกเนื้อหานี้ไปใส่:
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
3. ติดตั้งแพ็กเกจและซิงค์ฐานข้อมูล:
   ```bash
   # 1. ติดตั้ง Dependencies ทั้งหมด
   npm install
   
   # 2. ทำการซิงค์ Schema ของ Prisma เข้าสู่ฐานข้อมูล MariaDB
   npx prisma db push
   
   # 3. สร้าง Prisma Client สำหรับเรียกใช้งานในโค้ด
   npx prisma generate
   
   # 4. ใส่ข้อมูลเริ่มต้น (Seed) สำหรับหมวดหมู่คอร์สเรียน
   npm run seed:categories
   
   # 5. ใส่ข้อมูลผู้ใช้งานจำลองสำหรับทดสอบ (Demo Users)
   npm run seed:demo-users
   
   # 6. เริ่มรัน Backend Server ในโหมดพัฒนา (Development Mode)
   npm run dev
   ```
   * Backend Server จะทำงานที่: [http://localhost:3003](http://localhost:3003)

---

### ขั้นตอนที่ 3: ตั้งค่าฝั่งหน้าเว็บ (Client / Frontend Setup)
เปิด Terminal ใหม่ (ไม่ต้องปิดหน้าเซิร์ฟเวอร์ด้านบน) แล้วทำตามนี้:
1. เข้าไปที่โฟลเดอร์ `client`:
   ```bash
   cd client
   ```
2. ติดตั้งแพ็กเกจและรันหน้าเว็บ:
   ```bash
   # 1. ติดตั้ง Dependencies
   npm install
   
   # 2. เริ่มรันหน้าเว็บในโหมดพัฒนา
   npm run dev
   ```
   * หน้าเว็บจะทำงานที่: [http://localhost:5173](http://localhost:5173)

---

## 🇺🇸 English Installation Guide

Follow these steps to set up and run the project locally.

### Prerequisites
- **Node.js**: Version 20.19+ or 22.12+
- **Docker Desktop**
- **Git**

### Step 1: Start the Database
From the project root directory, run:
```bash
docker compose up -d
```
This starts a MariaDB container listening on port `3309`.

### Step 2: Server Setup (Backend)
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Create your `.env` file by copying the template `server/.env.example` or creating it with the following contents:
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
3. Install dependencies and sync the database schema:
   ```bash
   npm install
   npx prisma db push
   npx prisma generate
   npm run seed:categories
   npm run seed:demo-users
   npm run dev
   ```
   * Server runs at: [http://localhost:3003](http://localhost:3003)

### Step 3: Client Setup (Frontend)
Open another terminal:
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install packages and start the frontend:
   ```bash
   npm install
   npm run dev
   ```
   * Client runs at: [http://localhost:5173](http://localhost:5173)

---

## Useful Commands / คำสั่งที่มีประโยชน์

Server (ฝั่งเซิร์ฟเวอร์):
```bash
cd server
npx tsc --noEmit           # Type checking / ตรวจสอบความถูกต้องของประเภทข้อมูล
npx prisma db push         # Sync DB Schema / ซิงค์ข้อมูลโครงสร้างฐานข้อมูล
npx prisma generate        # Re-generate Prisma Client / อัปเดต Client ของ Prisma
npm run dev                # Run server / สตาร์ทเซิร์ฟเวอร์
```

Client (ฝั่งหน้าเว็บ):
```bash
cd client
npm run type-check         # Type checking / ตรวจสอบความถูกต้องของประเภทข้อมูลฝั่งหน้าบ้าน
npm run lint               # Linting / ตรวจสอบความถูกต้องของไวยากรณ์และสไตล์โค้ด
npm run dev                # Run frontend client / สตาร์ทโปรเจกต์หน้าบ้าน
```

---

## Demo Flow / ลำดับขั้นตอนการทดลองใช้งาน
1. **Register a student account** (สมัครสมาชิกด้วยสิทธิ์นักเรียน)
2. **Login as student** (ลงชื่อเข้าใช้งานด้วยบัญชีนักเรียน)
3. **Open course catalog and enroll in a course** (เปิดหน้าหมวดหมู่วิชาแล้วเลือกวิชาที่สนใจเพื่อเรียน)
4. **Upload a payment slip if the course has a price** (ส่งรูปสลิปเพื่อยืนยันการสมัคร หากคอร์สเรียนมีราคาตั้งไว้)
5. **Login as admin and approve the payment** (ล็อกอินบัญชีแอดมิน เพื่อตรวจสอบและอนุมัติสลิปเงินฝาก)
6. **Student opens dashboard and starts learning** (นักเรียนเข้ามายังหน้าแดชบอร์ดส่วนตัวและเริ่มเรียน)
7. **Complete lessons and quiz** (เรียนบทเรียนต่าง ๆ จนจบ และทำการสอบเก็บคะแนน)
8. **Generate certificate** (สร้างใบรับรอง/เกียรติบัตรเมื่อผ่านเกณฑ์)
9. **Submit a course review** (เขียนรีวิวและให้คะแนนเพื่อแบ่งปันข้อมูล)
10. **Request instructor role** (ส่งคำขอเป็นติวเตอร์หรือผู้สอนวิชา)
11. **Admin approves instructor request** (แอดมินอนุมัติสิทธิ์ผู้สอน)
12. **Instructor creates, publishes, edits, and deletes courses** (บัญชีผู้สอนเข้าใช้งานฟังก์ชันสร้างและบริหารจัดการคอร์สเรียนของตนเองได้)
