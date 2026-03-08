<script setup>
import { onMounted, ref } from 'vue';
import { useLabResultStore } from '../../stores/labResult';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const labResultStore = useLabResultStore();
const loading = ref(true);
const resultCardRefs = ref({});

onMounted(async () => {
  try {
    await labResultStore.fetchMyLabResults();
  } catch (error) {
    console.error('Failed to load lab results:', error);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getHasilIVALabel = (value) => {
  const labels = {
    'NEGATIF': 'Negatif',
    'POSITIF': 'Positif',
    'CURIGA_KANKER': 'Curiga Kanker'
  };
  return labels[value] || value;
};

const getSubTypeLabel = (value) => {
  const labels = {
    'NEGATIF': 'Negatif',
    'POSITIF': 'Positif',
    'TIDAK_TERBACA': 'Tidak Terbaca'
  };
  return labels[value] || '-';
};

const getHasilIVAColor = (value) => {
  if (value === 'NEGATIF') return 'green';
  if (value === 'POSITIF') return 'red';
  return 'yellow';
};

const downloadPDF = async (result) => {
  const cardElement = resultCardRefs.value[result.id];
  if (!cardElement) {
    alert('Gagal mengunduh PDF');
    return;
  }

  try {
    // Show loading state
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Memproses...';
    button.disabled = true;

    // Capture the card as canvas
    const canvas = await html2canvas(cardElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;

    // Add header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HASIL PEMERIKSAAN LABORATORIUM', pdfWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('SEFILA - Sistem Deteksi Kanker Leher Rahim', pdfWidth / 2, 22, { align: 'center' });

    // Add image
    pdf.addImage(imgData, 'PNG', imgX, 30, imgWidth * ratio * 0.9, imgHeight * ratio * 0.9);

    // Download
    const fileName = `hasil-lab-${result.pendaftaran?.nama || 'pasien'}-${formatDate(result.createdAt)}.pdf`;
    pdf.save(fileName.replace(/\s+/g, '-').toLowerCase());

    // Restore button
    button.innerHTML = originalText;
    button.disabled = false;

  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Gagal membuat PDF. Silakan coba lagi.');
  }
};

// Store ref for each result card
const setResultCardRef = (el, id) => {
  if (el) {
    resultCardRefs.value[id] = el;
  }
};
</script>

<template>
  <div class="min-h-screen bg-background py-8">
    <div class="container mx-auto px-4 max-w-5xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-textPrimary mb-2">Hasil Pemeriksaan Lab</h1>
        <p class="text-gray-600">Hasil pemeriksaan IVA Test dan DNA HPV Anda</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">Memuat data...</p>
      </div>

      <div v-else-if="labResultStore.labResults.length === 0" class="card text-center py-12">
        <div class="text-6xl mb-4">📊</div>
        <p class="text-gray-600">Belum ada hasil laboratorium</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="result in labResultStore.labResults" :key="result.id">
          <!-- Download Button -->
          <div class="flex justify-end mb-2">
            <button @click="downloadPDF(result)" class="btn-primary flex items-center gap-2">
              📥 Download PDF
            </button>
          </div>

          <!-- Result Card (for PDF export) -->
          <div :ref="(el) => setResultCardRef(el, result.id)" class="card bg-white">
            <!-- Header -->
            <div class="text-center mb-6 pb-6 border-b">
              <h2 class="text-2xl font-bold text-primary mb-2">SEFILA</h2>
              <p class="text-sm text-gray-600">Sistem Deteksi Kanker Leher Rahim - Puskesmas Bugangan</p>
              <div class="mt-4">
                <h3 class="text-xl font-bold text-textPrimary">
                  Hasil Lab - {{ result.pendaftaran?.nama || 'Pasien' }}
                </h3>
                <p class="text-sm text-gray-600">
                  NIK: {{ result.pendaftaran?.nik || '-' }}
                </p>
                <p class="text-sm text-gray-600">
                  Tanggal Pemeriksaan: {{ formatDate(result.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Section 1: Hasil IVA -->
            <div 
              :class="[
                'p-6 rounded-lg mb-6',
                getHasilIVAColor(result.hasilIVA) === 'green' ? 'bg-green-50 border-2 border-green-500' : 
                getHasilIVAColor(result.hasilIVA) === 'red' ? 'bg-red-50 border-2 border-red-500' :
                'bg-yellow-50 border-2 border-yellow-500'
              ]"
            >
              <p class="text-sm font-semibold mb-2" :class="getHasilIVAColor(result.hasilIVA) === 'green' ? 'text-green-600' : getHasilIVAColor(result.hasilIVA) === 'red' ? 'text-red-600' : 'text-yellow-600'">
                Hasil IVA
              </p>
              <p class="text-3xl font-bold" :class="getHasilIVAColor(result.hasilIVA) === 'green' ? 'text-green-600' : getHasilIVAColor(result.hasilIVA) === 'red' ? 'text-red-600' : 'text-yellow-600'">
                {{ result.hasilIVA === 'NEGATIF' ? '✅' : result.hasilIVA === 'POSITIF' ? '⚠️' : '🔍' }}
                {{ getHasilIVALabel(result.hasilIVA) }}
              </p>
            </div>

            <!-- Section 2: Hasil DNA HPV -->
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6 bg-gray-50">
              <h4 class="text-lg font-bold text-textPrimary mb-4">🧬 Hasil DNA HPV</h4>
              
              <!-- Specimen Info -->
              <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div class="p-3 bg-white rounded-lg">
                  <p class="text-xs text-gray-500 mb-1">Jenis Spesimen</p>
                  <p class="font-semibold text-textPrimary">{{ result.jenisSpesimen || '-' }}</p>
                </div>
                <div class="p-3 bg-white rounded-lg">
                  <p class="text-xs text-gray-500 mb-1">No. Spesimen</p>
                  <p class="font-semibold text-textPrimary">{{ result.noSpesimen || '-' }}</p>
                </div>
                <div class="p-3 bg-white rounded-lg">
                  <p class="text-xs text-gray-500 mb-1">Tanggal Pengambilan</p>
                  <p class="font-semibold text-textPrimary">{{ formatDate(result.tanggalPengambilan) }}</p>
                </div>
              </div>

              <!-- Sub Type Results -->
              <div class="border-t border-gray-300 pt-4">
                <h5 class="font-semibold text-gray-700 mb-3">Hasil Sub Type HPV</h5>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="p-3 bg-white rounded-lg text-center">
                    <p class="text-xs text-gray-500 mb-1">Sub Type 16</p>
                    <p 
                      class="font-bold text-sm"
                      :class="result.subType16 === 'POSITIF' ? 'text-red-600' : result.subType16 === 'NEGATIF' ? 'text-green-600' : 'text-gray-600'"
                    >
                      {{ getSubTypeLabel(result.subType16) }}
                    </p>
                  </div>
                  <div class="p-3 bg-white rounded-lg text-center">
                    <p class="text-xs text-gray-500 mb-1">Sub Type 18</p>
                    <p 
                      class="font-bold text-sm"
                      :class="result.subType18 === 'POSITIF' ? 'text-red-600' : result.subType18 === 'NEGATIF' ? 'text-green-600' : 'text-gray-600'"
                    >
                      {{ getSubTypeLabel(result.subType18) }}
                    </p>
                  </div>
                  <div class="p-3 bg-white rounded-lg text-center">
                    <p class="text-xs text-gray-500 mb-1">Sub Type 52</p>
                    <p 
                      class="font-bold text-sm"
                      :class="result.subType52 === 'POSITIF' ? 'text-red-600' : result.subType52 === 'NEGATIF' ? 'text-green-600' : 'text-gray-600'"
                    >
                      {{ getSubTypeLabel(result.subType52) }}
                    </p>
                  </div>
                  <div class="p-3 bg-white rounded-lg text-center">
                    <p class="text-xs text-gray-500 mb-1">Lainnya</p>
                    <p 
                      class="font-bold text-sm"
                      :class="result.subTypeLainnya === 'POSITIF' ? 'text-red-600' : result.subTypeLainnya === 'NEGATIF' ? 'text-green-600' : 'text-gray-600'"
                    >
                      {{ getSubTypeLabel(result.subTypeLainnya) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Tindak Lanjut -->
            <div v-if="result.tindakLanjut" class="mb-6 rounded-xl overflow-hidden border-2"
              :class="result.hasilIVA === 'POSITIF' ? 'border-red-400' : result.hasilIVA === 'NEGATIF' ? 'border-green-400' : 'border-yellow-400'"
            >
              <div class="px-6 py-3 font-bold text-white"
                :class="result.hasilIVA === 'POSITIF' ? 'bg-red-500' : result.hasilIVA === 'NEGATIF' ? 'bg-green-500' : 'bg-yellow-500'"
              >
                📋 Tindak Lanjut / Rekomendasi
              </div>
              <div class="p-6 bg-white space-y-3">
                <div v-for="(line, idx) in result.tindakLanjut.split('\n')" :key="idx" class="flex items-start gap-3">
                  <span v-if="line.startsWith('Hasil IVA')" class="text-lg mt-0.5">
                    {{ result.hasilIVA === 'NEGATIF' ? '✅' : result.hasilIVA === 'POSITIF' ? '🚨' : '⏳' }}
                  </span>
                  <span v-else-if="line.startsWith('DNA HPV')" class="text-lg mt-0.5">🧬</span>
                  <span v-else class="text-lg mt-0.5">📌</span>
                  <p class="text-gray-800 font-medium leading-relaxed">{{ line }}</p>
                </div>
              </div>
            </div>

            <!-- Doctor's Notes -->
            <div v-if="result.catatanDokter" class="p-4 bg-blue-50 rounded-lg mb-6">
              <p class="text-sm font-semibold text-primary mb-2">📝 Catatan Dokter</p>
              <p class="text-gray-700">{{ result.catatanDokter }}</p>
            </div>

            <!-- Footer -->
            <div class="mt-6 pt-4 border-t text-center text-sm text-gray-500">
              <p>Dokumen ini dicetak pada {{ new Date().toLocaleDateString('id-ID') }}</p>
              <p class="mt-1">SEFILA - Puskesmas Bugangan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
