<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import LeftBar from './LeftBar.vue'
import Logout from './Logout.vue'
import { Buffer } from "buffer";

const errorInputName = ref<string>()
const newName = ref<string>()

async function ChangeName(newName?: string) {
	await axios.post('player/profile/rename', { "newName": newName })
		.then(() => {
			errorInputName.value = "SUCCESS!!"
		}).catch((res) => {
			errorInputName.value = res.response.data.message;
		})
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
		<h1>New name:
			<input v-model="newName" placeholder="write new name" />
			<button @click="ChangeName(newName)">
				Change name
			</button>
			<p style=color:red>{{ errorInputName }} </p>
		</h1>
		<h1>
			<label>Change avatar:
				<input type="file" id="file" ref="input_file" v-on:change="handleFileUpload()" />
			</label>
			<button v-on:click="submitFile()">Submit</button>
			<p style=color:red>{{ errorInputAvatar }} </p>
		</h1>
		<div v-if="isTwoFactorAuthenticationEnabled === false" class="QrCodeSection">
			<h1>
				<img :src="qrCodeImg" />
			</h1>
			<h1> Scan QrCode and input code
				<input v-model="QrCodeCode" placeholder="code from google auth" />
				<button @click="ActiveQrCode(QrCodeCode)">
					Activate 2fa Authorization
				</button>
				<p style=color:red>{{ errorInputQrCode }} </p>
			</h1>
		</div>
		<div v-else>
			<input v-model="QrCodeCode" placeholder="code from google auth" />
			<button @click="TurnOffQrCode(QrCodeCode)">
				Turn off 2fa Authorization
			</button>
			<p style=color:red>{{ errorInputQrCode }} </p>
		</div>
	</div>
</template>

<style scoped>
.Settings {
	position: absolute;
	top: 5%;
	left: 30%;
}
</style>
