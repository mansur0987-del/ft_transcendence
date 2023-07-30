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
import { onMounted, ref, watch, watchEffect } from "vue";
import { useRouter, type PathParserOptions } from "vue-router";
import paper from 'paper';
import { Path, view, PointText } from 'paper';
import type { Socket } from "socket.io-client";


const props = defineProps<{
	gameSocket: Socket,
	roomInfo: Object,
	currentPlayerIndex: number
}>()

const paddleWidth = 20 / 1080;
const paddleHeight = 200 / 1920;
var ballPosition = [0.5, 0.5];
var ballRadius = 20 / 1920;
var paddlePos = [[0, 0.5], [1 - paddleWidth, 0.5]];
console.log("initial paddlePos");
console.log(paddlePos);
var score = [0, 0];
const router = useRouter();

// console.log("scope before setup");
// console.log(scope);
// scope.setup(canvasId);
// console.log("scope after setup");
// console.log(scope);
// console.log("canvasId is " + canvasId);
// paper.install(doc);
var scope = new paper.PaperScope();
var canvasId;
var initialTimeout = 100;
var isViewSetup = false;

onMounted(() => {
	canvasId = document.getElementById('canvasId') as HTMLCanvasElement;
	console.log("onMounted");
	console.log("scope before setup");
	console.log(scope);
	scope.setup(canvasId);
	console.log("scope after setup");
	console.log(scope);
	console.log("canvasId is " + canvasId);

	console.log('paper view');
	console.log(scope.view);
	while (scope.view == null) { }
	isViewSetup = true;
});

// the one who clicks Let's Play controls the left paddle,
// the other player controls the left paddle

watch(props, async (_oldProps, _newProps, cleanUp) => {
	setTimeout(() => {
		if (props) {
			if (scope.view != null) {
				// console.log("assigned props.currentPlayerIndex is " + props.currentPlayerIndex);
				initialTimeout = 0;

				props.gameSocket.on('paddle', (playedIndex, pos) => {
					// console.log('backend updates under playerindex ' + playedIndex + ' to ' + pos);
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

				var pingpong = new scope.PointText({
					point: [scope.view.center.x, pH * 0.75],
					content: `PING PONG`,
					fillColor: 'white',
					fontFamily: 'Arial',
					fontWeight: 'bold',
					fontSize: pH * 0.75,
					justification: 'center'
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

				var currRadius = ballRadius * scope.view.size.height;

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

				const handleResize = () => {
					scope.view.viewSize = new scope.Size([window.innerWidth, window.innerHeight]);
					pW = scope.view.size.width * paddleWidth;
					pH = scope.view.size.height * paddleHeight;
					ball.position = new scope.Point([(ballPosition[0] * scope.view.size.width) - ballRadius, (ballPosition[1] * scope.view.size.height) - ballRadius]);

					var newRadius = ballRadius * scope.view.size.height;
					ball.scale(newRadius / currRadius);
					currRadius = newRadius;

					scoreText.position = new scope.Point([scope.view.center.x, pH * 1.25]);
					scoreText.fontSize = pH / 2;
					pingpong.position = new scope.Point([scope.view.center.x, pH * 0.75]);
					pingpong.fontSize = pH * 0.75;
					paddleL.position = new scope.Point([pW / 2, (paddlePos[0][1]) * scope.view.size.height]);
					paddleR.position = new scope.Point([scope.view.size.width - pW / 2, (paddlePos[1][1]) * scope.view.size.height]);
				}

				scope.view.onFrame = (_event: any) => {
					// console.log("onFrame");
					if (ball.fillColor)
						ball.fillColor.hue += 1;
					paddleL.position = new scope.Point([pW, (paddlePos[0][1]) * scope.view.size.height]);
					paddleR.position = new scope.Point([scope.view.size.width - pW, (paddlePos[1][1]) * scope.view.size.height]);

				}

				scope.view.onKeyDown = (event: any) => {
					// console.log("a key is down")
					if (event.key == 'w' && paddlePos[props.currentPlayerIndex][1] - paddleHeight / 2 > 0) {
						// console.log("(w) before update-paddle emit:");
						// console.log(paddlePos);
						// console.log('about to substract 0.04 from ' + paddlePos[props.currentPlayerIndex][1]);
						// console.log('the result is ' + (paddlePos[props.currentPlayerIndex][1] - 0.04));
						props.gameSocket.emit('update-paddle', (paddlePos[props.currentPlayerIndex][1] - 0.04));
						// console.log("after update-paddle emit:");
						// console.log(paddlePos);
					}

					if (event.key == 's' && paddlePos[props.currentPlayerIndex][1] + paddleHeight / 2 < 1) {
						// console.log("(s)before update-paddle emit:");
						// console.log(paddlePos);
						// console.log('about to add 0.04 to ' + paddlePos[props.currentPlayerIndex][1]);
						// console.log('the result is ' + (paddlePos[props.currentPlayerIndex][1] + 0.04));
						props.gameSocket.emit('update-paddle', (paddlePos[props.currentPlayerIndex][1] + 0.04));
						// console.log("after update-paddle emit:");
						// console.log(paddlePos);
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


			// window.addEventListener('resize', handleResize);

			// const cleaner = () => {
			// 	window.removeEventListener('resize', handleResize);
			// 	props.gameSocket.off('ready');
			// 	props.gameSocket.off('score');
			// 	props.gameSocket.off('tray');
			// };
			// cleanUp(cleaner);
		}
	}, initialTimeout);

}, { immediate: true });

</script>