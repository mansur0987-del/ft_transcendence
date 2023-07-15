<template>
    <div class="w-full h-screen bg-black" ref="divRef">
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script>
export default {
    data() {
        return {
            paddleHeight: 0.05,
            paddleWidth: 0.005,
            paddleL: 0.5,
            paddleR: 0.5,
            ballX: 0.5,
            ballY: 0.5,
            ballW: 0.01,
            ballSpeed: 0.005,
            deltaY: -0.01 + Math.random() * 0.02,
            deltaX: 0.005,
            pause: false,
            displayMenu: true,
            mode: 1,
            scoreL: 0,
            scoreR: 0
        };
    },
    mounted() {
        const div = this.$refs.divRef;
        const canvas = this.$refs.canvasRef;
        const ctx = canvas.getContext("2d");

        if (!this.isPreview) {
            const socket = useContext(GameContext);
            this.gameSocket = socket;
        }

        this.mode = this.isPreview ? 1 : 3;

        if (!this.isPreview) {
            this.resetGame(this.mode !== 1);
        }

        this.animationId = requestAnimationFrame(loop.bind(this));
        window.addEventListener("keydown", this.keyInput);

        function loop() {
            canvas.width = div.offsetWidth;
            canvas.height = div.offsetHeight;
            this.draw(ctx, canvas);
            this.animationId = requestAnimationFrame(loop.bind(this));
        }
    },
    beforeUnmount() {
        cancelAnimationFrame(this.animationId);
    },
    methods: {
        resetGame(pause) {
            this.ballX = 0.5;
            this.ballY = 0.5;
            this.deltaY = -0.01 + Math.random() * 0.02;
            this.deltaX = Math.random() > 0.5 ? 0.005 : -0.005;
            this.ballSpeed = 0.005;
            this.pause = false;
            this.paddleL = 0.5;
            this.paddleR = 0.5;
        },
        moveOpponent(opponent) {
            if (opponent === "L" && this.deltaX > 0) {
                if (
                    this.ballY > this.paddleR + this.paddleHeight &&
                    this.paddleR < 0.95
                ) {
                    this.paddleR += 0.025;
                } else if (
                    this.ballY < this.paddleR - this.paddleHeight &&
                    this.paddleR > 0.05
                ) {
                    this.paddleR -= 0.025;
                }
            } else if (opponent === "R" && this.deltaX < 0) {
                if (
                    this.ballY > this.paddleL + this.paddleHeight &&
                    this.paddleL < 0.95
                ) {
                    this.paddleL += 0.025;
                } else if (
                    this.ballY < this.paddleL - this.paddleHeight &&
                    this.paddleL > 0.05
                ) {
                    this.paddleL -= 0.025;
                }
            }
        },
        touchingEdge() {
            if (
                (this.ballY + this.ballW >= 1 && this.deltaY > 0) ||
                (this.ballY - this.ballW <= 0 && this.deltaY < 0)
            ) {
                this.deltaY *= -1;
            }
        },
        touchingPaddle(canvas) {
            if (
                this.ballX + this.ballW >= 1 - this.paddleWidth &&
                this.ballY - this.ballW <= this.paddleR + this.paddleHeight &&
                this.ballY + this.ballW >= this.paddleR - this.paddleHeight &&
                this.deltaX > 0
            ) {
                this.deltaX = -1 * this.ballSpeed;
                this.deltaY = (this.ballY - this.paddleR) / 5;
                this.ballSpeed += 0.0001;
            } else if (
                this.ballX - this.ballW * 2 <= this.paddleWidth &&
                this.ballY - this.ballW <= this.paddleL + this.paddleHeight &&
                this.ballY + this.ballW >= this.paddleL - this.paddleHeight &&
                this.deltaX < 0
            ) {
                this.deltaX = this.ballSpeed;
                this.deltaY = (this.ballY - this.paddleL) / 5;
                this.ballSpeed += 0.0001;
            } else if (this.ballX > 1) {
                this.resetGame(this.mode !== 1);
                this.scoreL++;
            } else if (this.ballX < 0) {
                this.resetGame(this.mode !== 1);
                this.scoreR++;
            }
        },
        drawScore(ctx, canvas) {
            const text = `${this.scoreL} : ${this.scoreR}`;
            ctx.font = "42px Arial";
            const textWidth = ctx.measureText(text).width;
            const textX = (canvas.width - textWidth) / 2;
            const textY = canvas.height * 0.1;
            ctx.fillText(text, textX, textY);
        },
        bounceBall(ctx, canvas) {
            if (!this.pause) {
                this.ballX += this.deltaX;
                this.ballY += this.deltaY;
            } else {
                const text = `PAUSE`;
                ctx.font = "42px Arial";
                const textWidth = ctx.measureText(text).width;
                const textX = (canvas.width - textWidth) / 2;
                const textY = canvas.height * 0.45;
                ctx.fillText(text, textX, textY);
            }
            const ballR = canvas.width * this.ballW;
            const ballX = canvas.width * this.ballX;
            const ballY = canvas.height * this.ballY;
            ctx.arc(ballX - ballR / 2, ballY - ballR / 2, ballR, 0, 2 * Math.PI);
            ctx.fill();
        },
        paddles(ctx, canvas) {
            const paddleH = this.paddleHeight * canvas.height;
            const paddleW = this.paddleWidth * canvas.width;
            const paddleL = this.paddleL * canvas.height - paddleH;
            const paddleR = this.paddleR * canvas.height - paddleH;
            ctx.fillRect(0, paddleL, paddleW * 2, paddleH * 2);
            ctx.fillRect(
                canvas.width - paddleW * 2,
                paddleR,
                paddleW * 2,
                paddleH * 2
            );
        },
        draw(ctx, canvas) {
            ctx.fillStyle = "white";
            this.drawScore(ctx, canvas);
            this.bounceBall(ctx, canvas);
            this.touchingPaddle(canvas);
            this.touchingEdge();
            if (this.mode === 1) {
                this.moveOpponent("R");
                this.moveOpponent("L");
            } else if (this.mode === 2) {
                this.moveOpponent("L");
            } else if (this.mode === 3) {
                // Multiplayer
            }
            this.paddles(ctx, canvas);
        },
        handleMatchmaking(num) {
            this.mode = num;
            this.displayMenu = false;
            this.resetGame(true);
        }
    }
};
</script>