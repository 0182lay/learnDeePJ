# ສະຫຼຸບ Package ຂອງໂປຣເຈັກ

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap");

body,
body * {
  font-family: "Noto Sans Lao", "Phetsarath OT", "Saysettha OT", sans-serif;
}
</style>

ໄຟລ໌ນີ້ສະຫຼຸບ package ສຳຄັນທີ່ຕິດຕັ້ງໃນໂປຣເຈັກ LearnDeepJ ໂດຍແຍກຕາມ folder `client` ແລະ `server`. ເອົາໄວ້ອ່ານກ່ອນ present ເວລາຖືກຖາມວ່າໂປຣເຈັກນີ້ໃຊ້ library ຫຍັງແດ່.

## Client

ຕຳແໜ່ງໄຟລ໌:

```text
client/package.json
```

ຝັ່ງ `client` ແມ່ນ frontend ຂອງເວັບ ໃຊ້ Vue + Vite + TypeScript.

### Dependencies

| Package | ໃຊ້ເຮັດຫຍັງ |
| --- | --- |
| `vue` | framework ຫຼັກຂອງ frontend ໃຊ້ສ້າງໜ້າເວັບ ແລະ component |
| `vue-router` | ຈັດການ route ຂອງໜ້າເວັບ ເຊັ່ນ `/login`, `/courses`, `/dashboard` |
| `pinia` | ຈັດການ global state ເຊັ່ນ ຂໍ້ມູນ user, token, ສະຖານະ login |
| `axios` | ໃຊ້ສົ່ງ HTTP request ໄປຫາ backend API |
| `tailwindcss` | ໃຊ້ຂຽນ utility class ສຳລັບຕົກແຕ່ງ UI |
| `@tailwindcss/vite` | plugin ເຊື່ອມ Tailwind CSS ເຂົ້າກັບ Vite |

### Dev Dependencies

| Package | ໃຊ້ເຮັດຫຍັງ |
| --- | --- |
| `vite` | dev server ແລະ build tool ຂອງ frontend |
| `@vitejs/plugin-vue` | ເຮັດໃຫ້ Vite compile ໄຟລ໌ `.vue` ໄດ້ |
| `typescript` | ເພີ່ມ type checking ໃຫ້ JavaScript |
| `vue-tsc` | ກວດ type ຂອງໄຟລ໌ Vue + TypeScript |
| `eslint` | ກວດ code style ແລະຊ່ວຍຈັບບັນຫາໃນໂຄດ |
| `eslint-plugin-vue` | rule ຂອງ ESLint ສຳລັບ Vue |
| `@vue/eslint-config-typescript` | config ESLint ສຳລັບ Vue + TypeScript |
| `eslint-config-prettier` | ປິດ rule ທີ່ຊົນກັບ Prettier |
| `prettier` | format ໂຄດໃຫ້ອ່ານງ່າຍ ແລະເປັນມາດຕະຖານດຽວກັນ |
| `oxlint` | linter ຄວາມໄວສູງ ໃຊ້ຊ່ວຍກວດໂຄດ |
| `eslint-plugin-oxlint` | ເຊື່ອມ oxlint ກັບ ESLint |
| `npm-run-all2` | ຮັນ npm scripts ຫຼາຍຕົວແບບຕໍ່ກັນ ຫຼືພ້ອມກັນ |
| `vite-plugin-vue-devtools` | ເຄື່ອງມືຊ່ວຍ debug Vue ຕອນ dev |
| `@vue/tsconfig` | tsconfig ພື້ນຖານສຳລັບ Vue |
| `@tsconfig/node24` | tsconfig ພື້ນຖານສຳລັບ Node.js 24 |
| `@types/node` | type definitions ຂອງ Node.js |
| `jiti` | ຊ່ວຍໂຫຼດ config/module ທີ່ເປັນ TypeScript ຫຼື ESM |

### Client Scripts

| Script | ຄຳສັ່ງ | ໃຊ້ເຮັດຫຍັງ |
| --- | --- | --- |
| `dev` | `vite` | ເປີດ frontend dev server |
| `build` | `run-p type-check "build-only {@}" --` | ກວດ type ແລະ build frontend |
| `preview` | `vite preview` | ເປີດເບິ່ງຜົນ build |
| `build-only` | `vite build` | build frontend ຢ່າງດຽວ |
| `type-check` | `vue-tsc --build` | ກວດ type ຂອງ Vue/TypeScript |
| `lint` | `run-s lint:*` | ຮັນ lint ທັງໝົດ |
| `lint:oxlint` | `oxlint . --fix` | ກວດ ແລະແກ້ໂຄດດ້ວຍ oxlint |
| `lint:eslint` | `eslint . --fix --cache` | ກວດ ແລະແກ້ໂຄດດ້ວຍ ESLint |
| `format` | `prettier --write --experimental-cli src/` | format ໂຄດໃນ `src` |

## Server

ຕຳແໜ່ງໄຟລ໌:

```text
server/package.json
```

ຝັ່ງ `server` ແມ່ນ backend API ໃຊ້ Express + Prisma + MariaDB.

### Dependencies

| Package | ໃຊ້ເຮັດຫຍັງ |
| --- | --- |
| `express` | framework ຫຼັກສຳລັບສ້າງ API server ແລະ route |
| `@prisma/client` | Prisma client ໃຊ້ query database ຈາກໂຄດ TypeScript |
| `@prisma/adapter-mariadb` | adapter ສຳລັບເຊື່ອມ Prisma ກັບ MariaDB |
| `bcrypt` | hash password ກ່ອນເກັບລົງ database ແລະ compare password ຕອນ login |
| `jsonwebtoken` | ສ້າງ ແລະກວດ JWT token ສຳລັບລະບົບ login/auth |
| `multer` | ຮັບໄຟລ໌ upload ເຊັ່ນ avatar, course cover, lesson file, payment slip |
| `cors` | ອະນຸຍາດໃຫ້ frontend ເອີ້ນ backend ຂ້າມ origin ໄດ້ |
| `dotenv` | ໂຫຼດຄ່າຈາກໄຟລ໌ `.env` ເຊັ່ນ database URL ແລະ JWT secret |
| `morgan` | log request ໃນ terminal ຕອນ server ເຮັດວຽກ |
| `@types/cors` | type definitions ຂອງ `cors` |

### Dev Dependencies

| Package | ໃຊ້ເຮັດຫຍັງ |
| --- | --- |
| `typescript` | ເພີ່ມ type checking ໃຫ້ backend |
| `tsx` | ຮັນໄຟລ໌ TypeScript ໂດຍບໍ່ຕ້ອງ compile ເອງກ່ອນ |
| `prisma` | Prisma CLI ໃຊ້ຈັດການ schema, migration, generate client |
| `@types/node` | type definitions ຂອງ Node.js |
| `@types/express` | type definitions ຂອງ Express |
| `@types/bcrypt` | type definitions ຂອງ bcrypt |
| `@types/jsonwebtoken` | type definitions ຂອງ jsonwebtoken |
| `@types/morgan` | type definitions ຂອງ morgan |
| `@types/multer` | type definitions ຂອງ multer |

### Server Scripts

| Script | ຄຳສັ່ງ | ໃຊ້ເຮັດຫຍັງ |
| --- | --- | --- |
| `start` | `tsx src/server.ts` | ເປີດ server ແບບປົກກະຕິ |
| `dev` | `tsx watch src/server.ts` | ເປີດ server ແບບ watch ເມື່ອແກ້ໄຟລ໌ແລ້ວ reload |
| `seed:demo-users` | `tsx src/scripts/seedDemoUsers.ts` | ເພີ່ມ user ຕົວຢ່າງລົງ database |
| `seed:categories` | `tsx src/scripts/seedDefaultCategories.ts` | ເພີ່ມ category ເລີ່ມຕົ້ນລົງ database |
| `test` | `echo "Error: no test specified" && exit 1` | ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ test ຈິງ |

## ສະຫຼຸບສັ້ນໆສຳລັບຕອບຕອນ Present

```text
ໂປຣເຈັກນີ້ແບ່ງເປັນ 2 ສ່ວນຫຼັກ.

ຝັ່ງ client ໃຊ້ Vue 3 ເປັນ frontend framework, ໃຊ້ Vue Router ຈັດການໜ້າ, Pinia ເກັບ state, Axios ເອີ້ນ API ແລະ Vite ເປັນ dev server/build tool.

ຝັ່ງ server ໃຊ້ Express ສ້າງ REST API, Prisma ຕິດຕໍ່ MariaDB, bcrypt ເຂົ້າລະຫັດ password, JWT ເຮັດລະບົບ authentication ແລະ multer ໃຊ້ຈັດການ upload file.
```

