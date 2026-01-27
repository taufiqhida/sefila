const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
    try {
        const newPassword = 'admin123';

        // Cari admin
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) {
            console.log('❌ Admin user tidak ditemukan!');
            console.log('Jalankan create-admin.js terlebih dahulu.');
            return;
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password admin
        await prisma.user.update({
            where: { id: admin.id },
            data: { password: hashedPassword }
        });

        console.log('✅ Password admin berhasil diupdate!');
        console.log('\n📝 Kredensial Login Admin:');
        console.log('   NIK:', admin.nik);
        console.log('   Password:', newPassword);
        console.log('\n👤 Info Admin:');
        console.log('   Nama:', admin.name);
        console.log('   Email:', admin.email || '(tidak ada)');
        console.log('   Role:', admin.role);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdminPassword();
