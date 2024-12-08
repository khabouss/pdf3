<template>
  <div class="space-y-5 p-6 bg-white shadow-md rounded-lg mt-6 max-w-full mx-auto">
    <div>
      <label class="block text-lg font-semibold text-gray-800">Password Protection</label>
      <div class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter password"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm password"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div class="space-y-2">
          <label class="flex items-center">
            <input
              v-model="permissions.printing"
              type="checkbox"
              class="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm text-gray-600">Allow printing</span>
          </label>

          <label class="flex items-center">
            <input
              v-model="permissions.modifying"
              type="checkbox"
              class="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm text-gray-600">Allow modifying</span>
          </label>

          <label class="flex items-center">
            <input
              v-model="permissions.copying"
              type="checkbox"
              class="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-sm text-gray-600">Allow copying text and images</span>
          </label>
        </div>
      </div>
    </div>

    <p class="text-sm text-gray-600 italic mt-2">
      Add password protection to your PDF and set permissions for various actions.
    </p>

    <div class="flex gap-4 mt-6">
      <button
        @click="protectPDF"
        :disabled="!isValidPassword"
        class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Protect PDF
      </button>
    </div>

    <div v-if="error" class="text-red-600 text-sm mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PDFDocument } from 'pdf-lib'

const props = defineProps<{
  pdf?: PDFDocument | null
}>()

const emit = defineEmits(['update:pdf'])

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const permissions = ref({
  printing: true,
  modifying: true,
  copying: true
})

const isValidPassword = computed(() => {
  return password.value.length >= 6 && password.value === confirmPassword.value
})

const protectPDF = async () => {
  if (!props.pdf || !isValidPassword.value) return

  try {
    const pdfCopy = await PDFDocument.load(await props.pdf.save())
    
    // Set the password using pdf-lib's built-in encryption
    pdfCopy.encrypt({
      userPassword: password.value,
      ownerPassword: password.value,
      permissions: {
        printing: permissions.value.printing ? 'highResolution' : 'none',
        modifying: permissions.value.modifying,
        copying: permissions.value.copying,
        annotating: permissions.value.modifying,
        fillingForms: permissions.value.modifying,
        contentAccessibility: true,
        documentAssembly: permissions.value.modifying
      }
    })

    emit('update:pdf', pdfCopy)
    error.value = ''
    password.value = ''
    confirmPassword.value = ''
  } catch (e) {
    error.value = 'Failed to protect PDF. Please try again.'
    console.error('Error protecting PDF:', e)
  }
}
</script>

<style scoped>
button {
  transition: all 0.3s ease;
}

button:not(:disabled):hover {
  transform: scale(1.05);
}
</style>