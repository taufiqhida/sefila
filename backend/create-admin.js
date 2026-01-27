const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const adminNIK = '1234567890123456'; // NIK admin default
        const adminPassword = 'admin123';

        // Cek apakah admin sudah ada
        const existingAdmin = await prisma.user.findFirst({
            where: {
                OR: [
                    { nik: adminNIK },
                    { role: 'ADMIN' }
                ]
            }
        });

        if (existingAdmin) {
            console.log('✅ Admin user sudah ada:');
            console.log('   NIK:', existingAdmin.nik);
            console.log('   Nama:', existingAdmin.name);
            console.log('   Email:', existingAdmin.email || '(tidak ada)');
            console.log('\n📝 Untuk login gunakan:');
            console.log('   NIK:', existingAdmin.nik);
            console.log('   Password: (sesuai yang telah diset, default: tanggal lahir DDMMYYYY)');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Buat user admin dengan tanggal lahir default (01-01-1990)
        const birthDate = new Date('1990-01-01');

        // Buat user admin
        const admin = await prisma.user.create({
            data: {
                nik: adminNIK,
                email: 'admin@sefila.com',
                password: hashedPassword,
                name: 'Admin SEFILA',
                birthDate: birthDate,
                phoneNumber: '081234567890',
                role: 'ADMIN'
            }
        });

        console.log('✅ Admin user berhasil dibuat!');
        console.log('\n📝 Kredensial Login:');
        console.log('   NIK:', admin.nik);
        console.log('   Password:', adminPassword);
        console.log('\n👤 Info Admin:');
        console.log('   Nama:', admin.name);
        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
