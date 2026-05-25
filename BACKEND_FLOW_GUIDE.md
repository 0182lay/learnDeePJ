# ຄູ່ມືເບິ່ງ Flow ຂອງ Backend

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap");

body,
body * {
  font-family: "Noto Sans Lao", "Phetsarath OT", "Saysettha OT", sans-serif;
}
</style>

ໄຟລ໌ນີ້ເຮັດໄວ້ໃຫ້ອ່ານ backend ຂອງໂປຣເຈັກ LearnDeepJ ແບບມືໃໝ່. ເປົ້າໝາຍບໍ່ແມ່ນຈື່ code ທຸກບັນທັດ ແຕ່ໃຫ້ເຂົ້າໃຈວ່າ request ຈາກ frontend ເຂົ້າ backend ແລ້ວໄຫຼໄປທາງໃດ.

## ແນວຄິດຫຼັກຂອງ Backend

Backend ຂອງໂປຣເຈັກນີ້ໃຊ້ Express + Prisma.

ເສັ້ນທາງຫຼັກຂອງ request ແມ່ນ:

```text
server.ts
-> route
-> middleware ถ้ามี
-> controller
-> service
-> prisma
-> database
-> response ກັບໄປ frontend
```

ຈື່ແບບສັ້ນໆ:

```text
route = ບອກວ່າ URL ໃດໄປ function ໃດ
middleware = ກວດກ່ອນເຂົ້າ controller ເຊັ່ນ token ຫຼື role
controller = ຮັບ request, ເຊັກ input, ສົ່ງ response
service = logic ຫຼັກຂອງລະບົບ
prisma = ຕິດຕໍ່ database
```

## ໂຄງສ້າງ Folder ທີ່ຄວນຮູ້

```text
server/src/server.ts
server/src/routers
server/src/controllers
server/src/services
server/src/middlewares
server/src/lib/prisma.ts
server/prisma/schema.prisma
```

ແປງ່າຍໆ:

```text
server.ts = ຈຸດເລີ່ມ server
routers = ປະກາດ endpoint
controllers = ຮັບ req/res
services = logic ແລະ database query
middlewares = function ກວດ request ກ່ອນໄປ controller
lib/prisma.ts = ສ້າງ prisma client
schema.prisma = ແບບ database table/model
```

## `server.ts` ເຮັດຫຍັງ

ໄຟລ໌:

```text
server/src/server.ts
```

ບົດບາດຫຼັກ:

```text
1. ສ້າງ express app
2. ເປີດ cors
3. ໃຫ້ server ອ່ານ JSON body ໄດ້
4. ເປີດ morgan ເພື່ອ log request
5. ເປີດ static uploads folder
6. load router ທຸກໄຟລ໌ໃນ server/src/routers
7. mount router ໃສ່ prefix /api
8. listen port 3003
```

ເພາະ `server.ts` mount router ດ້ວຍ `/api` ທຸກ endpoint ເລີຍຂຶ້ນຕົ້ນດ້ວຍ:

```text
/api
```

ຕົວຢ່າງ:

```text
route ຂຽນ /login
endpoint ຈິງແມ່ນ /api/login
```

## Route ແມ່ນຫຍັງ

Route ແມ່ນບ່ອນບອກວ່າ endpoint ໃດໃຊ້ HTTP method ໃດ ແລະໃຫ້ໄປ controller function ໃດ.

ຕົວຢ່າງ:

```ts
router.post("/login", login);
```

ແປວ່າ:

```text
ຖ້າ frontend ຍິງ POST /api/login
ໃຫ້ backend ໄປເຮັດ function login ໃນ controller
```

ບາງ route ມີ middleware ກ່ອນ controller:

```ts
router.post(
  "/courses",
  auth,
  authorizeRoles("instructor", "admin"),
  createCourse,
);
```

ແປວ່າ:

```text
POST /api/courses
-> auth ກວດ token
-> authorizeRoles ກວດ role
-> createCourse controller
```

## Controller ແມ່ນຫຍັງ

Controller ແມ່ນບ່ອນຮັບ `req` ແລະສົ່ງ `res`.

ມັກເຮັດ 4 ຢ່າງ:

```text
1. ດຶງຂໍ້ມູນຈາກ req.body, req.params, req.query, req.file
2. validate input ບາງຢ່າງ
3. ເອີ້ນ service
4. ສົ່ງ response ກັບໄປ frontend
```

ຕົວຢ່າງຈາກ login:

```text
auth.controller.ts
-> ດຶງ email/password ຈາກ req.body
-> ເຊັກວ່າ email/password ມີບໍ່
-> ເອີ້ນ loginService(email, password)
-> ສົ່ງ User ແລະ Token ກັບໄປ
```

## Service ແມ່ນຫຍັງ

Service ແມ່ນບ່ອນຂຽນ logic ຫຼັກ ແລະຄຸຍກັບ database ຜ່ານ Prisma.

ຕົວຢ່າງຈາກ login:

```text
auth.service.ts
-> prisma.user.findUnique() ຫາ user ຈາກ email
-> bcrypt.compare() ກວດ password
-> jwt.sign() ສ້າງ token
-> return user/token ກັບ controller
```

ຈື່ແບບງ່າຍ:

```text
controller ຄຸມ request/response
service ຄຸມ business logic
```

## Prisma ແມ່ນຫຍັງ

Prisma ແມ່ນ ORM ທີ່ໃຊ້ຄຸຍກັບ database ດ້ວຍ TypeScript.

ຕົວຢ່າງ:

```ts
await prisma.user.findUnique({
  where: { email },
});
```

ແປວ່າ:

```text
ຫາ user 1 ຄົນຈາກ table User ໂດຍໃຊ້ email
```

ຕົວຢ່າງອື່ນ:

```ts
await prisma.course.create({
  data: {
    instructor_id,
    category_id,
    title,
    price,
  },
});
```

ແປວ່າ:

```text
ສ້າງ course ໃໝ່ລົງ database
```

## Middleware ແມ່ນຫຍັງ

Middleware ແມ່ນ function ທີ່ຂັ້ນກາງກ່ອນ request ຈະໄປ controller.

ໃນໂປຣເຈັກນີ້ທີ່ສຳຄັນແມ່ນ:

```text
auth.middleware.ts
authorizeRoles.ts
upload.middleware.ts
```

### `auth`

ໄຟລ໌:

```text
server/src/middlewares/auth.middleware.ts
```

ໜ້າທີ່:

```text
1. ອ່ານ Authorization header
2. ດຶງ Bearer token ອອກມາ
3. jwt.verify() ເພື່ອກວດ token
4. ຖ້າ token ຖືກ ເກັບ decoded user ໃສ່ req.user
5. ເອີ້ນ next() ໃຫ້ request ໄປຕໍ່
```

ຖ້າບໍ່ມີ token ຫຼື token ຜິດ ຈະຕອບ:

```text
401 NO_TOKEN
401 TOKEN_EXPIRED
401 INVALID_TOKEN
```

### `authorizeRoles`

ໃຊ້ກວດວ່າ user role ນີ້ມີສິດເຂົ້າ route ນັ້ນບໍ່.

ຕົວຢ່າງ:

```ts
authorizeRoles("instructor", "admin");
```

ແປວ່າ:

```text
route ນີ້ໃຫ້ instructor ແລະ admin ເຂົ້າໄດ້
student ເຂົ້າບໍ່ໄດ້
```

### Upload Middleware

ໃຊ້ `multer` ຈັດການ upload file.

ຕົວຢ່າງ:

```ts
uploadCourseCoverMiddleware.single("file");
```

ແປວ່າ:

```text
request ນີ້ຮັບ file 1 ໄຟລ໌
field name ຕ້ອງຊື່ file
ຫຼັງ upload ແລ້ວ controller ອ່ານໄດ້ຈາກ req.file
```

## ວິທີໄລ່ Backend Flow

ເວລາຢາກອ່ານ backend ໃຫ້ເລີ່ມຈາກ API endpoint ກ່ອນ.

ຕົວຢ່າງ:

```text
POST /api/login
```

ໃຫ້ໄລ່ແບບນີ້:

```text
1. ຫາ route ທີ່ມີ /login
2. ເບິ່ງວ່າ route ໄປ controller function ໃດ
3. ເບິ່ງ controller ວ່າອ່ານ req.body/params/query ຫຍັງ
4. ເບິ່ງ controller ເອີ້ນ service ໃດ
5. ເບິ່ງ service ວ່າ query database ຫຍັງ
6. ເບິ່ງ response ທີ່ controller ສົ່ງກັບ
```

## ຄຳທີ່ຄວນ Search ເວລາອ່ານ Backend

```text
router.get
router.post
router.patch
router.put
router.delete
req.body
req.params
req.query
req.file
res.status
await
try
catch
prisma.
findMany
findUnique
create
update
delete
deleteMany
$transaction
throw new Error
```

## Flow: Login

Endpoint:

```text
POST /api/login
```

ເສັ້ນທາງ:

```text
auth.route.ts
-> router.post("/login", login)
-> auth.controller.ts
-> login()
-> ດຶງ email/password ຈາກ req.body
-> ເອີ້ນ loginService(email, password)
-> auth.service.ts
-> prisma.user.findUnique({ where: { email } })
-> bcrypt.compare(password, user.password_hash)
-> jwt.sign(payload, JWT_SECRET)
-> controller ສົ່ງ User ແລະ Token ກັບໄປ frontend
```

ຈຸດທີ່ຄວນເຂົ້າໃຈ:

```text
ถ้า email ບໍ່ມີ -> USER_NOT_FOUND
ถ้า password ຜິດ -> INVALID_PASSWORD
ถ้าຖືກ -> ສ້າງ JWT token
```

## Flow: Register

Endpoint:

```text
POST /api/register
```

ເສັ້ນທາງ:

```text
auth.route.ts
-> router.post("/register", register)
-> auth.controller.ts
-> register()
-> ດຶງ email, password, first_name, last_name ຈາກ req.body
-> ເອີ້ນ registerService(...)
-> auth.service.ts
-> prisma.user.findUnique({ where: { email } }) ເຊັກ email ຊ້ຳ
-> bcrypt.hash(password, salt) hash password
-> prisma.user.create() ສ້າງ user ແລະ profile
-> controller ສົ່ງ response ວ່າ register ສຳເລັດ
```

ຈຸດທີ່ຄວນເຂົ້າໃຈ:

```text
ບໍ່ໄດ້ເກັບ password ດິບລົງ database
ແຕ່ເກັບ password_hash ທີ່ຜ່ານ bcrypt
```

## Flow: Get Courses

Endpoint:

```text
GET /api/courses
```

ເສັ້ນທາງ:

```text
course.route.ts
-> router.get("/courses", getCourses)
-> course.controller.ts
-> getCourses()
-> ເອີ້ນ getCoursesService()
-> course.service.ts
-> prisma.course.findMany({ where: { is_published: true } })
-> include category, instructor profile, reviews
-> attachReviewStats() ຄຳນວນ average_rating ແລະ review_count
-> controller ສົ່ງ courses ກັບ frontend
```

ຈຸດທີ່ຄວນເຂົ້າໃຈ:

```text
GET /api/courses ດຶງແຕ່ course ທີ່ is_published = true
ມີການຄຳນວນ rating ຈາກ reviews ກ່ອນສົ່ງກັບ frontend
```

## Flow: Create Course

Endpoint:

```text
POST /api/courses
```

ເສັ້ນທາງ:

```text
course.route.ts
-> router.post("/courses", auth, authorizeRoles("instructor", "admin"), createCourse)
-> auth middleware ກວດ token
-> authorizeRoles ກວດວ່າ user ເປັນ instructor/admin
-> course.controller.ts
-> createCourse()
-> ດຶງ instructor_id ຈາກ req.user
-> ດຶງ category_id, title, description, price, thumbnail_url, level, is_published ຈາກ req.body
-> ເອີ້ນ createCourseService(...)
-> course.service.ts
-> prisma.category.findUnique() ເຊັກ category ມີຈິງບໍ່
-> prisma.course.create() ສ້າງ course
-> controller ສົ່ງ course ທີ່ສ້າງກັບ frontend
```

ຈຸດທີ່ຄວນເຂົ້າໃຈ:

```text
route ນີ້ຕ້ອງ login ແລະຕ້ອງເປັນ instructor/admin
instructor_id ບໍ່ໄດ້ສົ່ງຈາກ frontend ແຕ່ດຶງຈາກ token ທີ່ auth middleware decode ໄວ້
```

## Flow: Upload Course Cover

Endpoint:

```text
POST /api/courses/cover/upload
```

ເສັ້ນທາງ:

```text
course.route.ts
-> auth
-> authorizeRoles("instructor", "admin")
-> uploadCourseCoverMiddleware.single("file")
-> uploadCourseCover controller
-> ອ່ານ uploaded file ຈາກ req.file
-> ສົ່ງ url, original_name, size_bytes ກັບ frontend
```

ຈຸດທີ່ຄວນເຂົ້າໃຈ:

```text
frontend ຕ້ອງສົ່ງ multipart/form-data
field name ຕ້ອງເປັນ file
```

## Flow: Update/Delete Course

Endpoint:

```text
PATCH /api/courses/:courseId
DELETE /api/courses/:courseId
```

ເສັ້ນທາງຫຼັກ:

```text
course.route.ts
-> auth
-> authorizeRoles("instructor", "admin")
-> controller
-> ດຶງ courseId ຈາກ req.params
-> ດຶງ user id/role ຈາກ req.user
-> service
-> prisma.course.findUnique() ເຊັກ course ມີຈິງບໍ່
-> ຖ້າບໍ່ແມ່ນ admin ຕ້ອງເປັນ instructor ເຈົ້າຂອງ course
-> update ຫຼື delete ໃນ database
```

ຈຸດທີ່ຄວນເຂົ້າໃຈ:

```text
admin ຈັດການ course ໄດ້ທຸກອັນ
instructor ຈັດການໄດ້ແຕ່ course ຂອງຕົນເອງ
```

## ວິທີເບິ່ງ Error

ໃນ backend ນີ້ service ມັກຈະ:

```ts
throw new Error("COURSE_NOT_FOUND");
```

ແລ້ວ controller ຈະ catch error:

```text
ถ้า error.message === "COURSE_NOT_FOUND"
-> response 404

ถ้า error.message === "FORBIDDEN"
-> response 403

ถ้า error ອື່ນ
-> response 500
```

ຈື່ code status ທີ່ເຈີບ່ອຍ:

```text
200 = ສຳເລັດ
201 = ສ້າງຂໍ້ມູນສຳເລັດ
400 = request ຜິດ ຫຼື input ບໍ່ຄົບ
401 = ບໍ່ໄດ້ login/token ຜິດ
403 = login ແລ້ວແຕ່ບໍ່ມີສິດ
404 = ບໍ່ພົບຂໍ້ມູນ
409 = ຂໍ້ມູນຊ້ຳ ເຊັ່ນ email ມີແລ້ວ
500 = server error
```

## ປະໂຫຍກໄວ້ຕອບຕອນ Present

ຖ້າໂດນຖາມວ່າ backend ເຮັດວຽກແນວໃດ:

```text
ຝັ່ງ backend ໃຊ້ Express ເປັນ API server. server.ts ຈະ load router ທຸກໄຟລ໌ແລະ mount ໃສ່ /api.
ແຕ່ລະ endpoint ຈະຜ່ານ route, middleware ຖ້າຕ້ອງກວດ token/role, ແລ້ວເຂົ້າ controller.
controller ຮັບ request ແລະ response, ສ່ວນ logic ຫຼັກຈະຢູ່ໃນ service.
service ຈະໃຊ້ Prisma ເພື່ອ query ຫຼື update database.
```

ຖ້າໂດນຖາມວ່າ token ກວດຍັງໄງ:

```text
backend ມີ auth middleware ທີ່ອ່ານ Authorization header, ດຶງ Bearer token ອອກມາ ແລ້ວໃຊ້ jwt.verify ກວດ token. ຖ້າ token ຖືກຈະເກັບ user ໃສ່ req.user ແລ້ວໃຫ້ request ໄປຕໍ່.
```

ຖ້າໂດນຖາມວ່າ service ຕ່າງຈາກ controller ຍັງໄງ:

```text
controller ເປັນບ່ອນຮັບ request ແລະສົ່ງ response, ສ່ວນ service ເປັນບ່ອນຂຽນ business logic ແລະຕິດຕໍ່ database ຜ່ານ Prisma.
```
