<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { ElInput, ElButton } from 'element-plus'


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
		<h3>Enter code:
			<el-input style="width: 70%;" v-model="code" placeholder="Enter code" />
			<el-button style="position: absolute; right: 0%;" @click="CheckCode(code)"> Enter</el-button>
			<p v-if="errorInputCode !== 'SUCCESS!!'" style="color:red; font-size: 16px; text-align: center;">{{
				errorInputCode }} </p>
			<p v-else style="color:green; font-size: 16px; text-align: center;">{{ errorInputCode }} </p>
		</h3>
	</div>
</template>

<style scoped>
.QrVerificate {
	position: fixed;
	top: 20%;
	left: 25%;
	width: 50%;
	height: 40%;
	max-height: 90%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
}

.QrVerificate:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 20%;
	left: 25%;
	width: 50%;
	height: 40%;
	max-height: 90%;
	right: 0;
	bottom: 0;
	border-radius: 10px;
	box-shadow: inset 0 10000px 200px rgba(255, 255, 255, .5);
	filter: blur(2px);
	margin: 0px;
	overflow: auto;
}
</style>
