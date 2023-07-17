<script setup lang="ts">
import axios from 'axios'

async function Redirect42() {
	axios.get('auth/login')
		.then((res) => (
			window.location.href = res.data)
		)
}
</script>

<template>
	<div class="button">
		<h1 class="button-text">Are you ready?</h1>
		<button @click="Redirect42()">
			Yes!
		</button>
	</div>
</template>

<style scoped>
.button {
	position: fixed;
	top: 20%;
	left: 25%;
	width: 50%;
	height: 8rem;
	box-shadow: 0 0 1rem 0 rgba(0, 0, 0, .2);
	border-radius: 5px;
	z-index: 1;
	background: inherit;
	overflow: hidden;
	border: none;
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
}

.button:before {
	content: "";
	position: absolute;
	background: inherit;
	z-index: -1;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	box-shadow: inset 0 100px 2000px rgb(231, 9, 9);
	filter: blur(0px);
	margin: -0px;
	border-radius: 20px;
}


.button-text {
	font-size: 50px;
	font-weight: bold;
	color: rgb(0, 0, 0);

}

.button button {
	background-color: greenyellow;
	/* Green */
	width: 100px;
	margin-left: auto;
	margin-right: auto;
	border: none;
	color: blueviolet;
	padding: 20px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 20px;
	transition: transform 500ms ease;
	border-radius: 20px;
	cursor: pointer;
}

.button button:hover {
	transform: scale(1.1) translateY(-5px);
}
</style>
