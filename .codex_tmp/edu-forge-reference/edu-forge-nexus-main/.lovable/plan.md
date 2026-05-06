## แผนเพิ่มฟีเจอร์ตาม DFD (ข้อมูลจำลอง)

### สิ่งที่มีอยู่แล้ว ✅
- 1.1-1.4: จัดการข้อมูลผู้ใช้, หมวดวิชา
- 2.1-2.3: หน้าลงทะเบียน (Student, Teacher, Admin)
- 3: อนุมัติผู้สอน (Admin Dashboard มีปุ่ม approve/reject)
- 4.1-4.4: สร้างคอร์ส, บทเรียน, อัปโหลดวิดีโอ, แบบทดสอบ
- 5.2: เข้าเรียน (Lesson viewer)
- Login/Auth mock

### สิ่งที่จะเพิ่ม 🆕

**1. ระบบ Enroll & ชำระเงินจำลอง (Process 5.1, 9.1, 9.2)**
- เพิ่ม mock enrollment state ใน AuthContext
- หน้า CourseDetail: กดปุ่ม "ซื้อคอร์ส" → แสดง Payment dialog จำลอง (เลือกวิธีชำระ, QR code จำลอง)
- เมื่อชำระเงินสำเร็จ → ปลดล็อกบทเรียนทั้งหมด
- D5: ข้อมูลการลงทะเบียน + D12: ข้อมูลการเงิน

**2. ระบบทำแบบทดสอบ & แสดงผล (Process 6.1, 6.2)**
- หน้า Quiz ใน CourseDetail: แสดงคำถาม, เลือกคำตอบ, ส่ง → แสดงคะแนน + เฉลย
- D7: ข้อมูลแบบทดสอบและคะแนน

**3. สำเร็จหลักสูตร & ใบรับรอง (Process 7)**
- เมื่อเรียนครบ + ผ่านแบบทดสอบ → แสดงปุ่ม "รับใบรับรอง"
- หน้า Certificate แสดงใบรับรองจำลอง
- D9, D10: รีวิว + คำติชม (เพิ่มฟอร์มเขียนรีวิว)

**4. Admin Reports & สถิติ (Process 8.1-8.6)**
- เพิ่ม tab "รายงาน" ใน Admin Dashboard
- Charts: จำนวนนักเรียน, รายได้, คอร์สยอดนิยม (ใช้ recharts)
- D11: ข้อมูลรายงานและสถิติ

**5. คำนวณค่าคอมมิชชัน (Process 9.2)**
- แสดงในหน้า Teacher Dashboard: รายได้, ค่าคอมมิชชัน (เช่น ระบบหัก 20%)
- แสดงใน Admin Reports: รายงานรายได้รวม + ค่าคอมมิชชัน

### ไฟล์ที่จะสร้าง/แก้ไข
- `src/data/mockData.ts` — เพิ่ม mock enrollment, payment, quiz data
- `src/contexts/AuthContext.tsx` — เพิ่ม enrollment state
- `src/pages/CourseDetail.tsx` — เพิ่ม payment dialog, quiz, certificate
- `src/pages/AdminDashboard.tsx` — เพิ่ม Reports tab with charts
- `src/pages/TeacherDashboard.tsx` — เพิ่มรายได้/คอมมิชชัน
- `src/pages/StudentDashboard.tsx` — เพิ่มใบรับรอง
- `src/components/PaymentDialog.tsx` — NEW
- `src/components/QuizPlayer.tsx` — NEW
- `src/components/Certificate.tsx` — NEW
