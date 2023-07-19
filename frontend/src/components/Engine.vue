<template>
    <div class="w-full h-screen bg-black" ref="divRef">
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { io, Socket } from "socket.io-client";


const props = defineProps<{
    isPreview: boolean,
    gameSocket: Socket
}>()

const canvasRef = ref<HTMLCanvasElement>()
const divRef = ref<HTMLDivElement>()

const state = ref({
    /* Paddle Array */
    paddleHeight: 0.05,
    paddleWidth: 0.005,
    paddleL: 0.5,
    paddleR: 0.5,
    /* ball */
    ballX: 0.5,
    ballY: 0.5,
    ballW: 0.01,
    ballSpeed: 0.005,   // speed of ball
    deltaY: -0.01 + Math.random() * 0.02, // change ball in  X AXIS
    deltaX: 0.005, // change ball in  X AXIS
    /* pause */
    pause: false, // pause the game
    /* menu */
    displayMenu: true,
    /* Score */
    mode: 1,
    scoreL: 0,
    scoreR: 0,
    /* game */
    gameSocket: null as Socket | null,
})

const animationId = ref(0);


const resetGame = (pause: any) => {
    state.value.ballX = 0.5;
    state.value.ballY = 0.5;

    state.value.deltaY = -0.01 + Math.random() * 0.02; // change ball in  X AXIS
    state.value.deltaX = Math.random() > 0.5 ? 0.005 : -0.005; // change ball in  X AXIS
    state.value.ballSpeed = 0.005;
    state.value.pause = false; // pause the game
    state.value.paddleL = 0.5;
    state.value.paddleR = 0.5;
};

onMounted(() => {
    const div = divRef.value;
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext('2d');
    if (!props.isPreview) {
        const socket = props.gameSocket;
        state.value.gameSocket = socket;
    }
    state.value.mode = props.isPreview ? 1 : 3;

    if (!props.isPreview) resetGame(state.value.mode != 1);

    animationId.value = requestAnimationFrame(loop.bind(this));
    // !!!!!!!!!
    //window.addEventListener('keydown', keyInput);
    // !!!!!!!

    const drawScore = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        var text = `${state.value.scoreL} : ${state.value.scoreR}`;
        ctx.font = '42px Arial';
        const textWidth = ctx.measureText(text).width;
        const textX = (canvas.width - textWidth) / 2;
        const textY = (canvas.height * 0.1);
        ctx.fillText(text, textX, textY);
    }

    const touchingEdge = () => {
        if (state.value.ballY + state.value.ballW >= 1 && state.value.deltaY > 0 ||
            state.value.ballY - state.value.ballW <= 0 && state.value.deltaY < 0) {
            state.value.deltaY = -1 * state.value.deltaY;
        }
    }

    const bounceBall = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        if (!state.value.pause) {
            state.value.ballX = state.value.ballX + state.value.deltaX;
            state.value.ballY = state.value.ballY + state.value.deltaY;
        } else {
            var text = `PAUSE`;
            ctx.font = '42px Arial';
            const textWidth = ctx.measureText(text).width;
            const textX = (canvas.width - textWidth) / 2;
            const textY = (canvas.height * 0.45);
            ctx.fillText(text, textX, textY);
        }
        const ballR = canvas.width * state.value.ballW;
        const ballX = canvas.width * state.value.ballX;
        const ballY = canvas.height * state.value.ballY;
        // ctx.fillRect(ballX - ballWidth/2, ballY - ballWidth/2, ballWidth, ballWidth);
        ctx.arc(ballX - ballR / 2, ballY - ballR / 2, ballR, 0, 2 * Math.PI);
        ctx.fill();
    }

    const touchingPaddle = (canvas: HTMLCanvasElement) => {
        if (
            state.value.ballX + state.value.ballW >= 1 - state.value.paddleWidth &&
            state.value.ballY - state.value.ballW <= state.value.paddleR + state.value.paddleHeight &&
            state.value.ballY + state.value.ballW >= state.value.paddleR - state.value.paddleHeight &&
            state.value.deltaX > 0
        ) {
            state.value.deltaX = -1 * state.value.ballSpeed;
            state.value.deltaY = (state.value.ballY - state.value.paddleR) / 5;
            state.value.ballSpeed = state.value.ballSpeed + 0.0001;
        } else if (
            state.value.ballX - state.value.ballW * 2 <= state.value.paddleWidth &&
            state.value.ballY - state.value.ballW <= state.value.paddleL + state.value.paddleHeight &&
            state.value.ballY + state.value.ballW >= state.value.paddleL - state.value.paddleHeight &&
            state.value.deltaX < 0
        ) {
            state.value.deltaX = state.value.ballSpeed,
                state.value.deltaY = (state.value.ballY - state.value.paddleL) / 5,
                state.value.ballSpeed = state.value.ballSpeed + 0.0001
        } else if (state.value.ballX > 1) {
            resetGame(state.value.mode != 1);
            state.value.scoreL = state.value.scoreL + 1;
        } else if (state.value.ballX < 0) {
            resetGame(state.value.mode != 1);
            state.value.scoreR = state.value.scoreR + 1;
        }

    }

    const paddles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        const paddleH = state.value.paddleHeight * canvas.height;
        const paddleW = state.value.paddleWidth * canvas.width;
        const paddleL = state.value.paddleL * canvas.height - paddleH;
        const paddleR = state.value.paddleR * canvas.height - paddleH;
        ctx.fillRect(0, paddleL, paddleW * 2, paddleH * 2);
        ctx.fillRect(canvas.width - paddleW * 2, paddleR, paddleW * 2, paddleH * 2);
    }

    const moveOpponent = (opponent: any) => {
        if (opponent === 'L' && state.value.deltaX > 0) {
            if (state.value.ballY > state.value.paddleR + state.value.paddleHeight &&
                state.value.paddleR < 0.95) {
                state.value.paddleR = state.value.paddleR + 0.025;
            } else if (state.value.ballY < state.value.paddleR - state.value.paddleHeight &&
                state.value.paddleR > 0.05) {
                state.value.paddleR = state.value.paddleR - 0.025;
            }
        } else if (opponent === 'R' && state.value.deltaX < 0) {
            if (state.value.ballY > state.value.paddleL + state.value.paddleHeight &&
                state.value.paddleL < 0.95) {
                state.value.paddleL = state.value.paddleL + 0.025;
            } else if (state.value.ballY < state.value.paddleL - state.value.paddleHeight &&
                state.value.paddleL > 0.05) {
                state.value.paddleL = state.value.paddleL - 0.025;
            }

        }
    }

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.fillStyle = 'white';
        drawScore(ctx, canvas);
        bounceBall(ctx, canvas);
        touchingPaddle(canvas);
        touchingEdge();
        if (state.value.mode == 1) { // Auto game 
            moveOpponent('R');
            moveOpponent('L');
        } else if (state.value.mode == 2) { // Single player
            moveOpponent('L');
        } else if (state.value.mode == 3) { // Multiplayer

        }
        paddles(ctx, canvas);
    }

    function loop() {
        if (canvas == null || div == null || ctx == null)
            return;
        canvas.width = div.offsetWidth;
        canvas.height = div.offsetHeight;
        draw(ctx, canvas);
        animationId.value = requestAnimationFrame(loop.bind(null));  // used to be bind(this)
    }

})



</script>