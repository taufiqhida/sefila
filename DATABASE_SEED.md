# 🌱 Database Seeding Guide

## Cara Mengisi Data Admin dengan DB Seed

### 📦 Apa itu Database Seeding?

Database seeding adalah proses mengisi database dengan data awal (default data) yang diperlukan untuk aplikasi berjalan. Untuk SEFILA, kita butuh minimal 1 admin user untuk bisa login.

---

## 🚀 Cara Menjalankan Seed

### Metode 1: Menggunakan npm script (Recommended)

```bash
cd backend
npm run db:seed
```

### Metode 2: Menggunakan Prisma

```bash
cd backend
npx prisma db seed
```

### Metode 3: Langsung dengan Node

```bash
cd backend
node prisma/seed.js
```

---

## 📝 Apa yang Di-seed?

File seed akan membuat:

### 1. **Admin User** ✅
- **NIK:** `admin`
- **Password:** `admin123`
- **Email:** admin@sefila.com
- **Nama:** Admin SEFILA
- **Role:** ADMIN

### 2. **Sample Patient** ✅ (Optional)
- **NIK:** `3374010101950001`
- **Password:** `01011995` (dari tanggal lahir)
- **Email:** patient.sample@example.com
- **Nama:** Pasien Contoh
- **Role:** PATIENT

### 3. **Sample Registration** ✅
- Pendaftaran IVA test untuk patient sample
- Status: PENDING
- Kelurahan: Bugangan

---

## 🔄 Kapan Harus Run Seed?

Run seed ketika:
- ✅ Pertama kali setup database
- ✅ Reset database dan butuh data awal
- ✅ Lupa password admin (seed akan update password)
- ✅ Development/testing butuh sample data

**Catatan:** Seed aman dijalankan berulang kali. Jika data sudah ada, seed akan update password admin.

---

## 📁 File Seed

File seed terletak di:
```
backend/prisma/seed.js
```

File ini sudah ter-konfigurasi di `package.json`:
```json
{
  "scripts": {
    "db:seed": "node prisma/seed.js"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

---

## ✅ Output yang Diharapkan

```
🌱 Start seeding database...

👤 Creating Admin User...
   ✅ Admin user created!

📝 Admin Credentials:
   NIK: admin
   Password: admin123

👥 Creating Sample Patient...
   ✅ Sample patient created!
   NIK: 3374010101950001
   Password: 01011995

📋 Creating Sample Registration...
   ✅ Sample registration created!

✅ Seeding completed successfully!
```

---

## 🛠️ Troubleshooting

### Error: "Admin user already exists"
Ini normal! Seed akan update password admin yang ada.

### Error: Database connection
Pastikan MySQL berjalan dan file `.env` sudah benar.

### Error: Prisma Client not generated
Jalankan:
```bash
npx prisma generate
```

---

## 🔐 Kredensial Setelah Seed

### Login sebagai Admin:
```
URL: http://localhost:5173/login
NIK: admin
Password: admin123
```

### Login sebagai Patient (Sample):
```
URL: http://localhost:5173/login
NIK: 3374010101950001
Password: 01011995
```

---

## 📚 Referensi

- File seed: [`prisma/seed.js`](file:///d:/web/enjel/backend/prisma/seed.js)
- Package.json: [`package.json`](file:///d:/web/enjel/backend/package.json)
- Prisma schema: [`prisma/schema.prisma`](file:///d:/web/enjel/backend/prisma/schema.prisma)
