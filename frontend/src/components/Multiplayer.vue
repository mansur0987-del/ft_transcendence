<template>
	<canvas ref="canvasId" class='w-full h-screen bg-black' />
</template>

<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from "vue";
import { useRouter, type PathParserOptions } from "vue-router";
import paper from 'paper';
import { Path, view, PointText } from 'paper';
import type { Socket } from "socket.io-client";

const props = defineProps<{
	gameSocket: Socket,
	roomInfo: Object
}>()

const canvasId = ref<HTMLCanvasElement>();
const paddleWidth = 20 / 1080;
const paddleHeight = 200 / 1920;
var ballPosition = [0.5, 0.5];
var ballRadius = 20 / 1920;
var paddlePos = [[0, 0.5], [1 - paddleWidth, 0.5]];
var score = [0, 0];
const router = useRouter();


watch(props, async (_oldProps, _newProps, cleanUp) => {
	console.log("ENTERED WATCH IN MULTIPLAYER.VUE")
	paper.setup(canvasId.value!);

	props.gameSocket.on('paddle', (data, pos) => {
		paddlePos[data][1] = pos
	})

	var pW = paper.view.size.width * paddleWidth;
	var pH = paper.view.size.height * paddleHeight;

	// Create paddles
	const paddleL = new paper.Path.Rectangle({
		point: [0, (paddlePos[0][1] - paddleHeight / 2) * paper.view.size.height],
		size: [pW, pH],
		fillColor: 'white'
	});

	const paddleR = new paper.Path.Rectangle({
		point: [paper.view.size.width - pW, (paddlePos[1][1] - paddleHeight / 2) * paper.view.size.height],
		size: [pW, pH],
		fillColor: 'white'
	});

	// Create ball
	var ball = new Path.Circle({
		center: [(ballPosition[0] * paper.view.size.width), (ballPosition[1] * paper.view.size.height) - ballRadius],
		radius: ballRadius * paper.view.size.height,
		fillColor: 'green'
	});
	var currRadius = ballRadius * paper.view.size.height;
	
	props.gameSocket.on('ball', (data) => {
		ball.position = normalize(data);
	});

	 // Create text
	var pingpong = new PointText({
		point: [paper.view.center.x, pH * 0.75],
		content: `PING PONG`,
		fillColor: 'white',
		fontFamily: 'Arial',
		fontWeight: 'bold',
		fontSize: pH * 0.75,
		justification: 'center'
	});

	 var scoreText = new PointText({
		point: [paper.view.center.x, pH * 1.25],
		content: `0 : 0`,
		fillColor: 'white',
		fontFamily: 'Arial',
		fontWeight: 'bold',
		fontSize: pH / 2,
		justification: 'center'
	});

	// props.gameSocket.on('ready', )

	props.gameSocket.on('score', (data) => {
		scoreText.content = `${data[0]} : ${data[1]}`;
		if (data[0] == 10 || data[1] == 10) {
			//cleanup vars?
			router.push("/player");
		}
	});

	const handleResize = () => {
		paper.view.viewSize = new paper.Size([window.innerWidth, window.innerHeight]);
		pW = paper.view.size.width * paddleWidth;
		pH = paper.view.size.height * paddleHeight;
		ball.position = new paper.Point([(ballPosition[0] * paper.view.size.width) - ballRadius, (ballPosition[1] * paper.view.size.height) - ballRadius]);
		
		var newRadius = ballRadius * paper.view.size.height;
		ball.scale(newRadius / currRadius);
		currRadius = newRadius;
		
		scoreText.position = new paper.Point([paper.view.center.x, pH * 1.25]);
		scoreText.fontSize = pH / 2;
		pingpong.position = new paper.Point([paper.view.center.x, pH * 0.75]);
		pingpong.fontSize = pH * 0.75;
		paddleL.position = new paper.Point([pW / 2, (paddlePos[0][1]) * paper.view.size.height]);
		paddleR.position = new paper.Point([paper.view.size.width - pW / 2, (paddlePos[1][1]) * paper.view.size.height]);
	}

	 paper.view.onFrame = (_event: any) => {
		 if (ball.fillColor)
			ball.fillColor.hue += 1; 
		paddleL.position = new paper.Point([pW, (paddlePos[0][1]) * paper.view.size.height]);
		paddleR.position = new paper.Point([paper.view.size.width - pW, (paddlePos[1][1]) * paper.view.size.height]);

	}

	function onKeyDown(event: { key: string; }) {
		if (event.key == 'w' && paddlePos[0][1] - paddleHeight / 2 > 0) {
			props.gameSocket.emit('update-tray', (paddlePos[0][1] - 0.04));
		}

		if (event.key == 's' && paddlePos[0][1] + paddleHeight / 2 < 1) {
			props.gameSocket.emit('update-tray', (paddlePos[0][1] + 0.04));
		}
	}

	const normalize = (coordinate: paper.Point): paper.Point => {
		var pos = [0, 0];
		pos[0] = coordinate.x / 1920 * paper.view.size.width;
		pos[1] = coordinate.y / 1080 * paper.view.size.height;
		return new paper.Point(pos);
	}

	window.addEventListener('resize', handleResize);

	const cleaner = () => {
		window.removeEventListener('resize', handleResize);
		props.gameSocket.off('ready');
		props.gameSocket.off('score');
		props.gameSocket.off('tray');
	};
	cleanUp(cleaner);

}, { immediate: true });

</script>

<style>
canvas {
	width: 100%;
	height: 100vh;
	background-color: black;
}
</style>