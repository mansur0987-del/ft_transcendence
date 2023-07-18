<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";

function checkVisible() {
	if (document.visibilityState !== "visible") {
		axios.post('player/profile', { updateData: { status: 0 } })
	}
	else {
		axios.post('player/profile', { updateData: { status: 1 } })
	}
}

onMounted(() => {
	axios.post('player/profile', { updateData: { status: 1 } })
	document.addEventListener('visibilitychange', checkVisible)
})

</script>

<template></template>
