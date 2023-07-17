<script>
import {paper, Path, view, PointText } from 'paper';
import { useRoute, useRouter } from 'vue_router';

export default {
	props: {
		gameSocket: Object, // not sure about the type
		mode: Number,
		isInvited: Boolean,
		playerId: Number,
		toStart: Boolean,
	},
	setup(props) {
		const canvasRef = ref(null);
		const parentRef = ref(null);
		const paddleWidth = 20 / 1080;
		const paddleHeight = 200 / 1920;
		var ballPosition = [0.5, 0.5];
		var ballRadius = 20 / 1920;
		var paddlePos = [[0, 0.5], [1 - paddleWidth, 0.5]];
		var score = [0, 0];
		const router = useRouter();

		watchEffect(() => {

		});
	}
}

</script>