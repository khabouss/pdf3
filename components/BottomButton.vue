<template>
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-39 px-6" style="position: fixed; display: flex; align-items: center; display: flex; gap: 12rem;">

    <!-- Scroll to Bottom Button -->
    <button 
      class="bg-indigo-600"
      @click="scrollToBottom" 
      >
      <span>↓</span> <!-- Simple arrow -->
    </button>

    <!-- Scroll to Top Button (appears when #bottom-action-buttons is visible) -->
    <button 
      class="bg-indigo-600"
      @click="scrollToTop" 
      >
      <span>↑</span> <!-- Simple arrow -->
    </button>

  </div>
</template>

<script>
export default {
  methods: {
    scrollToBottom() {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
  },
}
</script>

<style scoped>
/* Optional: Customize the button style */
button {
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
</style>
