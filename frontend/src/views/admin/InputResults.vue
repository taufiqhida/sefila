<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRegistrationStore } from '../../stores/registration';
import { useLabResultStore } from '../../stores/labResult';

const router = useRouter();
const registrationStore = useRegistrationStore();
const labResultStore = useLabResultStore();

const props = defineProps({
  registrationId: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
const saving = ref(false);
const error = ref('');
const success = ref(false);

const formData = ref({
  pendaftaranId: parseInt(props.registrationId),
  
  // Hasil IVA
  hasilIVA: 'NEGATIF',
  
  // Hasil DNA HPV
  jenisSpesimen: '',
  noSpesimen: '',
  tanggalPengambilan: '',
  subType16: '',
  subType18: '',
  subType52: '',
  subTypeLainnya: '',
  
  // Doctor Notes
  catatanDokter: '',
});

const hasilIVAOptions = [
  { value: 'NEGATIF', label: 'Negatif' },
  { value: 'POSITIF', label: 'Positif' },
  { value: 'CURIGA_KANKER', label: 'Curiga Kanker' },
];

const hasilDNAHPVOptions = [
  { value: '', label: 'Pilih Hasil' },
  { value: 'NEGATIF', label: 'Negatif' },
  { value: 'POSITIF', label: 'Positif' },
  { value: 'TIDAK_TERBACA', label: 'Tidak Terbaca' },
];

// Computed preview of tindak lanjut
const tindakLanjutPreview = computed(() => {
  const parts = [];

  switch (formData.value.hasilIVA) {
    case 'NEGATIF':
      parts.push({ icon: '✅', text: 'Hasil IVA Negatif: Periksa kembali dalam 1 tahun.', color: 'text-green-700' });
      break;
    case 'POSITIF':
      parts.push({ icon: '🚨', text: 'Hasil IVA Positif: Krioterapi atau rujukan dengan membawa surat rekomendasi dari Puskesmas Bugangan.', color: 'text-red-700' });
      break;
    case 'CURIGA_KANKER':
      parts.push({ icon: '⏳', text: 'Hasil IVA Ragu-ragu: Periksa kembali dalam 6 bulan.', color: 'text-yellow-700' });
      break;
  }

  const subTypes = {
    subType16: 'Sub Type 16',
    subType18: 'Sub Type 18',
    subType52: 'Sub Type 52',
    subTypeLainnya: 'Sub Type Lainnya',
  };
  const positifList = Object.entries(subTypes)
    .filter(([key]) => formData.value[key] === 'POSITIF')
    .map(([, label]) => label);

  if (positifList.length > 0) {
    parts.push({ icon: '🧬', text: `DNA HPV Positif (${positifList.join(', ')}): Periksa kembali dalam 6 bulan.`, color: 'text-orange-700' });
  }

  return parts;
});

onMounted(async () => {
  try {
    await registrationStore.fetchRegistrationById(props.registrationId);
  } catch (error) {
    console.error('Failed to load registration:', error);
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  error.value = '';
  saving.value = true;

  try {
    await labResultStore.createLabResult(formData.value);
    success.value = true;
    
    setTimeout(() => {
      router.push('/admin/pendaftaran');
    }, 2000);
  } catch (err) {
    error.value = labResultStore.error || 'Gagal menyimpan hasil lab';
  } finally {
    saving.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
</script>

<template>
  <div class="min-h-screen bg-background py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-textPrimary mb-2">Input Hasil Laboratorium</h1>
        <p class="text-gray-600">Masukkan hasil pemeriksaan IVA Test</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Success Message -->
      <div v-else-if="success" class="card bg-success/10 border-2 border-success">
        <div class="text-center py-8">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-2xl font-bold text-success mb-2">Hasil Lab Berhasil Disimpan!</h2>
          <p class="text-gray-700">Pasien dapat melihat hasil di dashboard mereka</p>
        </div>
      </div>

      <div v-else>
        <!-- Check if patient has arrived -->
        <div v-if="registrationStore.currentRegistration?.status !== 'ARRIVED'" class="card bg-yellow-50 border-2 border-yellow-400 mb-6">
          <div class="flex items-start gap-4">
            <div class="text-4xl">⚠️</div>
            <div>
              <h3 class="text-lg font-bold text-yellow-800 mb-2">Pasien Belum Diverifikasi</h3>
              <p class="text-yellow-700 mb-4">
                Status pasien: <strong>{{ registrationStore.currentRegistration?.status }}</strong><br>
                Anda harus verifikasi kedatangan pasien terlebih dahulu sebelum input hasil lab.
              </p>
              <button @click="router.push('/admin/pendaftaran')" class="btn-outline">
                ← Kembali ke Daftar Pendaftaran
              </button>
            </div>
          </div>
        </div>

        <template v-else>
          <!-- Patient Info -->
          <div class="card mb-6">
            <h3 class="text-xl font-bold text-textPrimary mb-4">Informasi Pasien</h3>
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-gray-600">NIK</p>
                <p class="font-semibold text-textPrimary">{{ registrationStore.currentRegistration?.nik }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Nama</p>
                <p class="font-semibold text-textPrimary">{{ registrationStore.currentRegistration?.nama }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Tanggal Lahir</p>
                <p class="font-semibold text-textPrimary">{{ formatDate(registrationStore.currentRegistration?.tanggalLahir) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Alamat</p>
                <p class="font-semibold text-textPrimary">{{ registrationStore.currentRegistration?.alamat }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Kelurahan</p>
                <p class="font-semibold text-textPrimary">{{ registrationStore.currentRegistration?.kelurahan }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status</p>
                <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ Sudah Datang
                </span>
              </div>
            </div>
          </div>

          <!-- Lab Result Form -->
          <div class="card">
            <form @submit.prevent="handleSubmit" class="space-y-8">
              <!-- Section 1: Hasil IVA -->
              <div>
                <h4 class="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <span class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span>
                  Hasil IVA
                </h4>
                <div>
                  <label class="block text-sm font-semibold text-textPrimary mb-2">Hasil Pemeriksaan IVA</label>
                  <select v-model="formData.hasilIVA" required class="input-field max-w-md">
                    <option v-for="opt in hasilIVAOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Section 2: Hasil DNA HPV -->
              <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                <h4 class="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <span class="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm">2</span>
                  Hasil DNA HPV
                </h4>
                
                <div class="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label class="block text-sm font-semibold text-textPrimary mb-2">Jenis Spesimen</label>
                    <input 
                      v-model="formData.jenisSpesimen" 
                      type="text" 
                      class="input-field" 
                      placeholder="Contoh: Swab Serviks" 
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-textPrimary mb-2">No. Spesimen</label>
                    <input 
                      v-model="formData.noSpesimen" 
                      type="text" 
                      class="input-field" 
                      placeholder="Nomor spesimen" 
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-textPrimary mb-2">Tanggal Pengambilan</label>
                    <input 
                      v-model="formData.tanggalPengambilan" 
                      type="date" 
                      class="input-field" 
                    />
                  </div>
                </div>

                <div class="border-t border-gray-300 pt-6">
                  <h5 class="font-semibold text-textPrimary mb-4">Hasil Sub Type HPV</h5>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-textPrimary mb-2">Sub Type 16</label>
                      <select v-model="formData.subType16" class="input-field">
                        <option v-for="opt in hasilDNAHPVOptions" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-textPrimary mb-2">Sub Type 18</label>
                      <select v-model="formData.subType18" class="input-field">
                        <option v-for="opt in hasilDNAHPVOptions" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-textPrimary mb-2">Sub Type 52</label>
                      <select v-model="formData.subType52" class="input-field">
                        <option v-for="opt in hasilDNAHPVOptions" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-textPrimary mb-2">Lainnya</label>
                      <select v-model="formData.subTypeLainnya" class="input-field">
                        <option v-for="opt in hasilDNAHPVOptions" :key="opt.value" :value="opt.value">
                          {{ opt.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 3: Preview Tindak Lanjut -->
              <div class="rounded-xl overflow-hidden border-2 border-indigo-300">
                <div class="px-6 py-3 bg-indigo-500 font-bold text-white flex items-center gap-2">
                  📋 Preview Tindak Lanjut (Otomatis)
                </div>
                <div class="p-6 bg-indigo-50 space-y-3">
                  <div v-if="tindakLanjutPreview.length === 0" class="text-gray-500 italic text-sm">
                    Tindak lanjut akan muncul setelah Anda memilih hasil IVA.
                  </div>
                  <div v-for="(item, idx) in tindakLanjutPreview" :key="idx" class="flex items-start gap-3">
                    <span class="text-lg mt-0.5">{{ item.icon }}</span>
                    <p class="font-medium leading-relaxed" :class="item.color">{{ item.text }}</p>
                  </div>
                </div>
              </div>

              <!-- Section 4: Doctor's Notes -->
              <div>
                <h4 class="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                  <span class="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-sm">3</span>
                  Catatan Dokter
                </h4>
                <textarea
                  v-model="formData.catatanDokter"
                  rows="4"
                  class="input-field"
                  placeholder="Catatan, rekomendasi, atau saran untuk pasien"
                ></textarea>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 text-sm">{{ error }}</p>
              </div>

              <!-- Submit Button -->
              <div class="flex gap-4">
                <button type="button" @click="router.push('/admin/pendaftaran')" class="btn-outline">
                  Batal
                </button>
                <button type="submit" :disabled="saving" class="btn-primary flex-1">
                  {{ saving ? 'Menyimpan...' : 'Simpan Hasil Lab' }}
                </button>
              </div>
            </form>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
