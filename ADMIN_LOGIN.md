# Login Credentials

## Admin Login

Untuk login sebagai admin, gunakan:

**NIK:** `admin`  
**Password:** `admin123`

---

## Cara Login

1. Buka browser dan akses: http://localhost:5173/login
2. Masukkan NIK: `admin`
3. Masukkan Password: `admin123`
4. Klik tombol "Masuk"
5. Anda akan diarahkan ke dashboard admin

---

## Informasi Penting

- **NIK admin bukan NIK 16 digit**, cukup ketik: `admin`
- Password sudah diupdate menjadi: `admin123`
- Jika lupa password, jalankan: `node update-admin-password.js` di folder backend

---

## Troubleshooting

### Jika tidak bisa login:

1. Pastikan backend berjalan di port 3001
2. Pastikan frontend berjalan di port 5173
3. Cek di console browser apakah ada error
4. Pastikan database MySQL berjalan

### Reset password admin:

```bash
cd backend
node update-admin-password.js
```
