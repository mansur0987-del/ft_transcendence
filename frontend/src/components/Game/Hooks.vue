<template>
  <script setup>
    import { ref, onMounted, onUnmounted } from 'vue';

        const keysPressed = ref({});

        const downHandler = (event) => {
          keysPressed.value = {
            ...keysPressed.value,
            [event.key]: true,
          };
        };

        const upHandler = (event) => {
          keysPressed.value = {
            ...keysPressed.value,
            [event.key]: false,
          };
        };

        onMounted(() => {
          window.addEventListener('keydown', downHandler);
          window.addEventListener('keyup', upHandler);

          onUnmounted(() => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
          });
        });
  </script>
</template>
