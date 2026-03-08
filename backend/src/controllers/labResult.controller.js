const prisma = require('../config/database');

// ===============================
// Auto-generate Tindak Lanjut
// ===============================
const generateTindakLanjut = (hasilIVA, subType16, subType18, subType52, subTypeLainnya) => {
    const parts = [];

    // --- Tindak lanjut berdasarkan Hasil IVA ---
    switch (hasilIVA) {
        case 'NEGATIF':
            parts.push('Hasil IVA Negatif: Periksa kembali dalam 1 tahun.');
            break;
        case 'POSITIF':
            parts.push('Hasil IVA Positif: Krioterapi atau rujukan dengan membawa surat rekomendasi dari Puskesmas Bugangan.');
            break;
        case 'CURIGA_KANKER':
            parts.push('Hasil IVA Ragu-ragu: Periksa kembali dalam 6 bulan.');
            break;
    }

    // --- Tindak lanjut berdasarkan Hasil DNA HPV ---
    const dnaSubTypes = { subType16, subType18, subType52, subTypeLainnya };
    const positifTypes = Object.entries(dnaSubTypes)
        .filter(([_, val]) => val === 'POSITIF')
        .map(([key]) => {
            const labels = {
                subType16: 'Sub Type 16',
                subType18: 'Sub Type 18',
                subType52: 'Sub Type 52',
                subTypeLainnya: 'Sub Type Lainnya',
            };
            return labels[key];
        });

    if (positifTypes.length > 0) {
        parts.push(`DNA HPV Positif (${positifTypes.join(', ')}): Periksa kembali dalam 6 bulan.`);
    }

    return parts.join('\n');
};

// Create lab result
const createLabResult = async (req, res) => {
    try {
        const {
            pendaftaranId,
            hasilIVA,
            jenisSpesimen,
            noSpesimen,
            tanggalPengambilan,
            subType16,
            subType18,
            subType52,
            subTypeLainnya,
            catatanDokter
        } = req.body;

        // Validation
        if (!pendaftaranId || !hasilIVA) {
            return res.status(400).json({
                success: false,
                message: 'Pendaftaran ID dan Hasil IVA wajib diisi.'
            });
        }

        // Check if registration exists and status is ARRIVED
        const registration = await prisma.pendaftaran.findUnique({
            where: { id: pendaftaranId }
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Pendaftaran tidak ditemukan.'
            });
        }

        if (registration.status !== 'ARRIVED') {
            return res.status(400).json({
                success: false,
                message: 'Pasien belum diverifikasi kedatangannya. Silakan verifikasi kedatangan terlebih dahulu.'
            });
        }

        // Check if lab result already exists
        const existingResult = await prisma.hasilLab.findUnique({
            where: { pendaftaranId }
        });

        if (existingResult) {
            return res.status(400).json({
                success: false,
                message: 'Hasil lab sudah ada untuk pendaftaran ini.'
            });
        }

        // Auto-generate tindak lanjut
        const tindakLanjut = generateTindakLanjut(hasilIVA, subType16, subType18, subType52, subTypeLainnya);

        // Create lab result
        const labResult = await prisma.hasilLab.create({
            data: {
                pendaftaranId,
                hasilIVA: hasilIVA || 'NEGATIF',
                tindakLanjut,
                jenisSpesimen,
                noSpesimen,
                tanggalPengambilan: tanggalPengambilan ? new Date(tanggalPengambilan) : null,
                subType16,
                subType18,
                subType52,
                subTypeLainnya,
                catatanDokter
            }
        });

        // Update registration status to COMPLETED
        await prisma.pendaftaran.update({
            where: { id: pendaftaranId },
            data: {
                status: 'COMPLETED',
                tanggalPemeriksaan: new Date()
            }
        });

        res.status(201).json({
            success: true,
            message: 'Hasil lab berhasil disimpan.',
            data: labResult
        });
    } catch (error) {
        console.error('Create lab result error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menyimpan hasil lab.'
        });
    }
};

// Get lab result by registration ID
const getLabResultByRegistration = async (req, res) => {
    try {
        const { registrationId } = req.params;

        const labResult = await prisma.hasilLab.findUnique({
            where: { pendaftaranId: parseInt(registrationId) },
            include: {
                pendaftaran: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!labResult) {
            return res.status(404).json({
                success: false,
                message: 'Hasil lab tidak ditemukan.'
            });
        }

        // Check authorization
        if (req.user.role === 'PATIENT' && labResult.pendaftaran.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak.'
            });
        }

        res.json({
            success: true,
            data: labResult
        });
    } catch (error) {
        console.error('Get lab result error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

// Update lab result
const updateLabResult = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            hasilIVA,
            jenisSpesimen,
            noSpesimen,
            tanggalPengambilan,
            subType16,
            subType18,
            subType52,
            subTypeLainnya,
            catatanDokter
        } = req.body;

        // Auto-generate tindak lanjut if hasilIVA is provided
        let tindakLanjut;
        if (hasilIVA) {
            tindakLanjut = generateTindakLanjut(hasilIVA, subType16, subType18, subType52, subTypeLainnya);
        }

        const labResult = await prisma.hasilLab.update({
            where: { id: parseInt(id) },
            data: {
                hasilIVA,
                ...(tindakLanjut !== undefined && { tindakLanjut }),
                jenisSpesimen,
                noSpesimen,
                tanggalPengambilan: tanggalPengambilan ? new Date(tanggalPengambilan) : undefined,
                subType16,
                subType18,
                subType52,
                subTypeLainnya,
                catatanDokter
            }
        });

        res.json({
            success: true,
            message: 'Hasil lab berhasil diperbarui.',
            data: labResult
        });
    } catch (error) {
        console.error('Update lab result error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

// Get patient's lab results
const getPatientLabResults = async (req, res) => {
    try {
        const userId = req.user.id;

        const labResults = await prisma.hasilLab.findMany({
            where: {
                pendaftaran: {
                    userId
                }
            },
            include: {
                pendaftaran: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            data: labResults
        });
    } catch (error) {
        console.error('Get patient lab results error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
};

module.exports = {
    createLabResult,
    getLabResultByRegistration,
    updateLabResult,
    getPatientLabResults
};
