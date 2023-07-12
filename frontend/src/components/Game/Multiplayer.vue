<template>
    <canvas ref="canvasRef" class="w-full h-screen bg-black"></canvas>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue';
import { paper, Path, PointText, view } from 'paper';
import { useNavigate } from 'vue-router-dom';
// import { GameContext } from '../context/GameSocket';

export default {
    setup(props) {
        const { gameSocket, mode } = props;
        const canvasRef = ref(null);
        const paddleWidth = 20 / 1080;
        const paddleHeight = 200 / 1920;
        const ballPosition = [0.5, 0.5];
        const ballRadius = 20 / 1920;
        const paddlePos = [[0, 0.5], [1 - paddleWidth, 0.5]];
        const score = [0, 0];
        const navigate = useNavigate();
        const { setInvite, playerId, start, setStart } = useContext(GameContext);

        const handleResize = () => {
            view.viewSize = [window.innerWidth, window.innerHeight];
            pW = view.size.width * paddleWidth;
            pH = view.size.height * paddleHeight;
            ball.position = [
                ballPosition[0] * view.size.width - ballRadius,
                ballPosition[1] * view.size.height - ballRadius,
            ];
            ball.radius = ballRadius * view.size.height;
            scoreText.position = [view.center.x, pH * 1.25];
            scoreText.fontSize = pH / 2;
            pingpong.position = [view.center.x, pH * 0.75];
            pingpong.fontSize = pH * 0.75;
            paddleL.position = [pW / 2, paddlePos[0][1] * view.size.height];
            paddleR.position = [
                view.size.width - pW / 2,
                paddlePos[1][1] * view.size.height,
            ];
        };

        onMounted(() => {
            paper.setup(canvasRef.value);

            gameSocket.on('tray', (data, pos) => {
                paddlePos[data][1] = pos;
            });

            let pW = view.size.width * paddleWidth;
            let pH = view.size.height * paddleHeight;

            // Create paddles
            const paddleL = new paper.Path.Rectangle({
                point: [
                    0,
                    (paddlePos[0][1] - paddleHeight / 2) * view.size.height,
                ],
                size: [pW, pH],
                fillColor: 'white',
            });

            const paddleR = new paper.Path.Rectangle({
                point: [
                    view.size.width - pW,
                    (paddlePos[1][1] - paddleHeight / 2) * view.size.height,
                ],
                size: [pW, pH],
                fillColor: 'white',
            });

            // Create ball
            const ball = new Path.Circle({
                center: [
                    ballPosition[0] * view.size.width,
                    ballPosition[1] * view.size.height - ballRadius,
                ],
                radius: ballRadius * view.size.height,
                fillColor: 'green',
            });

            gameSocket.on('ball', (data) => {
                ball.position = normalize(data);
            });

            // Create text
            const pingpong = new PointText({
                point: [view.center.x, pH * 0.75],
                content: `PING PONG`,
                fillColor: 'white',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: pH * 0.75,
                justification: 'center',
            });

            const scoreText = new PointText({
                point: [view.center.x, pH * 1.25],
                content: `0 : 0`,
                fillColor: 'white',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: pH / 2,
                justification: 'center',
            });

            const readyText = new PointText({
                point: view.center,
                content: start ? '' : `Are you Ready?\nPress Space...`,
                fillColor: 'white',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: pH / 2,
                justification: 'center',
            });

            async function timer() {
                let counter = 3;

                const interval = setInterval(() => {
                    counter--;
                    readyText.content = `Game start in ${counter}...`;
                }, 1000);

                await new Promise((resolve) => setTimeout(resolve, 3000));
                gameSocket.emit('start');
                readyText.remove();
                clearInterval(interval);
            }

            gameSocket.on('ready', (data) => {
                console.log('Ready: ', data);
                setInvite(true);
                timer();
                setStart(true);
            });

            gameSocket.on('score', (data) => {
                scoreText.content = `${data[0]} : ${data[1]}`;
                if (data[0] == 10 || data[1] == 10) {
                    setInvite(false);
                    setStart(false);
                    navigate('/transcendence/user/dashboard');
                }
            });

            paper.view.onFrame = (event) => {
                ball.fillColor.hue += 1;
                paddleL.position = [pW, paddlePos[0][1] * view.size.height];
                paddleR.position = [
                    view.size.width - pW,
                    paddlePos[1][1] * view.size.height,
                ];
            };

            paper.view.onKeyDown = (event) => {
                if (
                    event.key == 'w' &&
                    paddlePos[playerId][1] - paddleHeight / 2 > 0
                ) {
                    gameSocket.emit('update-tray', paddlePos[playerId][1] - 0.04);
                }

                if (
                    event.key == 's' &&
                    paddlePos[playerId][1] + paddleHeight / 2 < 1
                ) {
                    gameSocket.emit('update-tray', paddlePos[playerId][1] + 0.04);
                }

                if (event.key == 'space' && !start) {
                    if (!mode)
                        gameSocket.emit('ready', { plan: 0, mode: 0 });
                    else gameSocket.emit('ready', { plan: 0, mode: mode });
                    readyText.content = start ? '' : `Wait another player...`;
                }
            };

            window.addEventListener('resize', handleResize);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('resize', handleResize);
            gameSocket.off('ready');
            gameSocket.off('score');
            gameSocket.off('tray');
        });

        const normalize = (coordinate) => {
            const pos = [0, 0];
            pos[0] = (coordinate.x / 1920) * view.size.width;
            pos[1] = (coordinate.y / 1080) * view.size.height;
            return pos;
        };

        return {
            canvasRef,
        };
    },
};
</script>
