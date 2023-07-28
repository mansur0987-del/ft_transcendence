import { io } from 'socket.io-client';

const socketGame = io(process.env.BASE_URL + 'pong', {
		transportOptions: {
			polling: { extraHeaders: { Authorization: 'Bearer ' + localStorage.getItem('token') } },
		},
	})

export default socketGame
