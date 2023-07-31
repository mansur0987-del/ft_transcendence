<template>
	<canvas id="canvasId" class='canvas' />
</template>

<style>
canvas {
	width: 100%;
	height: 100vh;
	background-color: black;
}
</style>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import paper from 'paper';
import { Path, PointText } from 'paper';
import type { Socket } from "socket.io-client";


const props = defineProps<{
	gameSocket: Socket,
	roomInfo: Object,
	currentPlayerIndex: number
}>()

const paddleWidth = 20 / 1080;
let paddleHeight = 200 / 1920;
let ballPosition = [0.5, 0.5];
let ballRadius = 20 / 1920;
let paddlePos = [[0, 0.5], [1 - paddleWidth, 0.5]];
const router = useRouter();

let scope = new paper.PaperScope();
let canvasId;
let initialTimeout = 100;
let isViewSetup = false;

onMounted(() => {
	canvasId = document.getElementById('canvasId') as HTMLCanvasElement;
	scope.setup(canvasId);
	while (scope.view == null) { }
	isViewSetup = true;
	props.gameSocket.on('paddleHeight', (data) => {
		paddleHeight = data / 1920;
	})
});

// the one who clicks Let's Play controls the left paddle,
// the other player controls the left paddle

watch(props, async (_oldProps, _newProps, cleanUp) => {
	setTimeout(() => {
		if (props) {
			if (scope.view != null) {
				initialTimeout = 0;

				props.gameSocket.on('paddle', (playedIndex, pos) => {
					paddlePos[playedIndex][1] = pos;
				})


				var pW = scope.view.size.width * paddleWidth;
				var pH = scope.view.size.height * paddleHeight;

				// Create paddles
				const paddleL = new scope.Path.Rectangle({
					point: [0, (paddlePos[0][1] - paddleHeight / 2) * scope.view.size.height],
					size: [pW, pH],
					fillColor: 'white'
				});

				const paddleR = new scope.Path.Rectangle({
					point: [scope.view.size.width - pW, (paddlePos[1][1] - paddleHeight / 2) * scope.view.size.height],
					size: [pW, pH],
					fillColor: 'white'
				});

				if (props.currentPlayerIndex == 0) {
					paddleL.fillColor?.set('green');
				}
				else {
					paddleR.fillColor?.set('green');
				}

				// Create ball
				var ball = new Path.Circle({
					center: [(ballPosition[0] * scope.view.size.width), (ballPosition[1] * scope.view.size.height) - ballRadius],
					radius: ballRadius * scope.view.size.height,
					fillColor: 'green'
				});

				var scoreText = new PointText({
					point: [scope.view.center.x, pH * 1.25],
					content: `0 : 0`,
					fillColor: 'white',
					fontFamily: 'Arial',
					fontWeight: 'bold',
					fontSize: pH / 2,
					justification: 'center'
				});

				props.gameSocket.on('ball', (data) => {
					ball.position = normalize(data);
				});

				props.gameSocket.on('score', (data) => {
					scoreText.content = `${data[0]} : ${data[1]}`;
					if (data[0] == 10 || data[1] == 10) {
						//cleanup vars?
						router.push("/player");
					}
				});

				scope.view.onFrame = (_event: any) => {
					if (ball.fillColor)
						ball.fillColor.hue += 1;
					paddleL.position = new scope.Point([pW, (paddlePos[0][1]) * scope.view.size.height]);
					paddleR.position = new scope.Point([scope.view.size.width - pW, (paddlePos[1][1]) * scope.view.size.height]);

				}

				scope.view.onKeyDown = (event: any) => {
					if (event.key == 'w' && paddlePos[props.currentPlayerIndex][1] - paddleHeight / 2 > 0) {
						props.gameSocket.emit('update-paddle', (paddlePos[props.currentPlayerIndex][1] - 0.04));
					}

					if (event.key == 's' && paddlePos[props.currentPlayerIndex][1] + paddleHeight / 2 < 1) {
						props.gameSocket.emit('update-paddle', (paddlePos[props.currentPlayerIndex][1] + 0.04));
					}
				}

				const normalize = (coordinate: paper.Point): paper.Point => {
					var pos = [0, 0];
					pos[0] = coordinate.x / 1920 * scope.view.size.width;
					pos[1] = coordinate.y / 1080 * scope.view.size.height;
					return new scope.Point(pos);
				}
				return;
			}
		}
	}, initialTimeout);

}, { immediate: true });

</script>
