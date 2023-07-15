<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";


const errorInputCode = ref<string>()
const code = ref<string>('')

async function CheckCode(code: string) {
	await axios.post('auth/signin', { "twoFactorAuthenticationCode": code })
		.then(() => {
			errorInputCode.value = "SUCCESS!!"
		}).catch((res) => {
			errorInputCode.value = res.response.data.message;
		})

	if (errorInputCode.value === "SUCCESS!!") {
		window.location.href = 'Player'
	}
}

</script>

<template>
	<div class="QrVerificate">
		<h1>Enter code:
			<input v-model="code" placeholder="Enter code" />
			<button @click="CheckCode(code)"> Enter</button>
			<p style=color:red>{{ errorInputCode }} </p>
		</h1>
	</div>
</template>

<style scoped>
</style>
