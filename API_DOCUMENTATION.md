# 📋 SEFILA API Documentation

**Base URL:** `http://localhost:3001/api`

---

## 🔐 Authentication APIs
**Base Path:** `/api/auth`

### Public Routes (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | ❌ **DISABLED** - Admin creates users now |
| POST | `/api/auth/login` | Login untuk semua user (admin & patient) |

### Protected Routes (Authentication Required)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/profile` | Mendapatkan profil user yang sedang login | ✅ Bearer Token |

---

## 👥 Admin APIs
**Base Path:** `/api/admin`

> ⚠️ **All routes require ADMIN role**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/admin/users` | Membuat user baru (oleh admin) | ✅ Admin Only |
| GET | `/api/admin/users` | Mendapatkan semua user | ✅ Admin Only |
| PUT | `/api/admin/users/:id` | Update user berdasarkan ID | ✅ Admin Only |
| DELETE | `/api/admin/users/:id` | Hapus user berdasarkan ID | ✅ Admin Only |

---

## 📝 Registration APIs
**Base Path:** `/api/registrations`

### Patient Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/registrations` | Membuat registrasi baru | ✅ User Token |
| GET | `/api/registrations/my-registrations` | Mendapatkan registrasi milik patient yang login | ✅ User Token |

### Admin Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/registrations` | Mendapatkan semua registrasi | ✅ Admin Only |
| GET | `/api/registrations/:id` | Mendapatkan registrasi berdasarkan ID | ✅ User Token |
| PATCH | `/api/registrations/:id/status` | Update status registrasi | ✅ Admin Only |
| PATCH | `/api/registrations/:id/verify-arrival` | Verifikasi kedatangan pasien | ✅ Admin Only |

---

## 🔬 Lab Result APIs
**Base Path:** `/api/lab-results`

### Patient Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/lab-results/my-results` | Mendapatkan semua hasil lab milik patient | ✅ User Token |
| GET | `/api/lab-results/registration/:registrationId` | Mendapatkan hasil lab berdasarkan registrasi | ✅ User Token |

### Admin Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/lab-results` | Membuat hasil lab baru | ✅ Admin Only |
| PUT | `/api/lab-results/:id` | Update hasil lab berdasarkan ID | ✅ Admin Only |

---

## 📊 Statistics APIs
**Base Path:** `/api/stats`

### Public Routes (No Authentication Required)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/stats/kelurahan-public` | Mendapatkan statistik kelurahan (public) | ❌ Public |

### Admin Only Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/stats/dashboard` | Mendapatkan statistik dashboard | ✅ Admin Only |
| GET | `/api/stats/distribution` | Mendapatkan distribusi pasien | ✅ Admin Only |
| GET | `/api/stats/monthly-trends` | Mendapatkan trend bulanan | ✅ Admin Only |
| GET | `/api/stats/kelurahan` | Mendapatkan statistik kelurahan (admin) | ✅ Admin Only |

---

## 🔑 Authentication Header Format

Untuk endpoint yang memerlukan authentication, gunakan header berikut:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📌 Summary

### Total Endpoints: **27**

- ✅ **Public:** 2 endpoints
- 🔐 **Authenticated:** 6 endpoints
- 👑 **Admin Only:** 15 endpoints
- ❌ **Disabled:** 1 endpoint
- 🔓 **Public Stats:** 1 endpoint

### API Groups:
1. **Auth APIs:** 3 endpoints
2. **Admin APIs:** 4 endpoints
3. **Registration APIs:** 6 endpoints
4. **Lab Results APIs:** 4 endpoints
5. **Statistics APIs:** 5 endpoints

---

## 🚀 Quick Test

Test if API server is running:
```bash
curl http://localhost:3001
```

Expected response:
```json
{
  "message": "SEFILA API Server is running"
}
```

---

## ⚙️ CORS Configuration

Allowed origins:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
