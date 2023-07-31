<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { Buffer } from "buffer";
import { ElInput, ElButton } from 'element-plus'

const errorInputName = ref<string>()
const newName = ref<string>()

async function ChangeName(newName?: string) {
	if (!newName) {
		errorInputName.value = 'Input name'
	}
	else if (newName.length > 15) {
		errorInputName.value = 'Enter a name of less than 15 characters'
	}
	else if (newName.substring(0, 6) === 'guest_') {
		errorInputName.value = "You cannot choose a 'guest_...' name"
	}
	else {
		await axios.post('player/profile/rename', { "newName": newName })
			.then(() => {
				errorInputName.value = "SUCCESS!!"
			}).catch((res) => {
				errorInputName.value = res.response.data.message;
			})
	}

}

const file = ref<string>('')
const input_file = ref<any>();
const errorInputAvatar = ref<string>()

async function submitFile() {
	let formData = new FormData();
	await formData.append('file', file.value);
	axios.post(
		'player/avatar',
		formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	}
	).then(function () {
		errorInputAvatar.value = 'SUCCESS!!'
	}).catch(function () {
		errorInputAvatar.value = 'FAILURE!!';
	});
}
async function handleFileUpload() {
	file.value = input_file.value.files[0];
}

const isTwoFactorAuthenticationEnabled = ref<boolean>(false)
const qrCodeImg = ref<any>()

async function checkTwoFa() {
	const data = (await axios.get('auth/checkplayer')).data
	if (data.isTwoFactorAuthenticationEnabled === false) {
		GetQrCode()
	}
	else {
		isTwoFactorAuthenticationEnabled.value = data.isTwoFactorAuthenticationEnabled
	}

}

async function GetQrCode() {
	const data = (await axios.get('auth/2fa/generate', { responseType: 'arraybuffer' })).data
	const tmp_url_qrcode = "data:image/*" + ";base64," + Buffer.from(data).toString('base64');
	var tmp_instance = axios.create();
	delete tmp_instance.defaults.baseURL
	delete tmp_instance.defaults.headers.common['Authorization'];
	qrCodeImg.value = (await tmp_instance.get(tmp_url_qrcode)).data
}

onMounted(() => {
	checkTwoFa()
})

const errorInputQrCode = ref<string>()
const QrCodeCode = ref<string>()

async function ActiveQrCode(code?: string) {
	await axios.post('auth/2fa/authenticate', { "twoFactorAuthenticationCode": code })
		.then(() => {
			errorInputQrCode.value = "SUCCESS!!"
		}).catch((res) => {
			errorInputQrCode.value = res.response.data.message;
		})

	if (errorInputQrCode.value === "SUCCESS!!") {
		window.location.href = 'Login'
	}
}

async function TurnOffQrCode(code?: string) {
	await axios.post('auth/2fa/turn-off', { "twoFactorAuthenticationCode": code })
		.then(() => {
			errorInputQrCode.value = "SUCCESS!!"
		}).catch((res) => {
			errorInputQrCode.value = res.response.data.message;
		})
	if (errorInputQrCode.value === "SUCCESS!!") {
		window.location.href = "Settings"
	}
}

</script>

<template>
	<LeftBar />
	<Logout />
	<div class="Settings">
		<h3 style="padding: 5px;">Change name
			<el-input v-model="newName" clearable placeholder="write new name" style="width: 70%;" />
			<el-button style="position: absolute; right: 0%;" @click="ChangeName(newName)">
				Submit
			</el-button>
			<p v-if="errorInputName !== 'SUCCESS!!'" style="color:red; font-size: 16px; text-align: center;">{{
				errorInputName }} </p>
			<p v-else style="color:green; font-size: 16px; text-align: center;">{{ errorInputName }} </p>
		</h3>
		<h3 style="padding: 5px;">Change avatar
			<input slot style="width: 70%;" type="file" id="file" ref="input_file" v-on:change="handleFileUpload()" />

			<el-button style="position: absolute; right: 0%;" v-on:click="submitFile()">Submit</el-button>
			<p v-if="errorInputAvatar !== 'SUCCESS!!'" style="color:red; font-size: 16px; text-align: center;">{{
				errorInputAvatar }} </p>
			<p v-else style="color:green; font-size: 16px; text-align: center;">{{ errorInputAvatar }} </p>
		</h3>
		<div style="padding: 5px;" v-if="isTwoFactorAuthenticationEnabled === false" class="QrCodeSection">
			<h3>
				<img :src="qrCodeImg" />

				Scan QrCode and input code
				<el-input style="width: 70%;" v-model="QrCodeCode" placeholder="code from google auth" />
				<el-button style="position: absolute; right: 0%;" @click="ActiveQrCode(QrCodeCode)">
					Activate 2fa Authorization
				</el-button>
				<p v-if="errorInputQrCode !== 'SUCCESS!!'" style="color:red; font-size: 16px; text-align: center;">{{
					errorInputQrCode }} </p>
				<p v-else style="color:green; font-size: 16px; text-align: center;">{{ errorInputQrCode }} </p>
			</h3>
		</div>
		<div v-else style="padding: 5px;">
			<el-input style="width: 70%;" v-model="QrCodeCode" placeholder="code from google auth" />
			<el-button style="position: absolute; right: 0%;" @click="TurnOffQrCode(QrCodeCode)">
				Turn off 2fa Authorization
			</el-button>
			<p v-if="errorInputQrCode !== 'SUCCESS!!'" style="color:red; font-size: 16px; text-align: center;">{{
				errorInputQrCode }} </p>
			<p v-else style="color:green; font-size: 16px; text-align: center;">{{ errorInputQrCode }} </p>
		</div>
	</div>
</template>

<style scoped>
.Settings {
	position: fixed;
	top: 5%;
	left: 35%;
	width: 50%;
	height: max-content;
	max-height: 90%;
	border-radius: 10px;
	z-index: 1;
	overflow: auto;
}

.Settings:after {
	content: "";
	position: fixed;
	background: inherit;
	z-index: -1;
	top: 5%;
	left: 35%;
	width: 50%;
	height: auto;
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
