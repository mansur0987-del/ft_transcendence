import { io } from 'socket.io-client';

const socketChat = io(process.env.BASE_URL + 'chat', {
		transportOptions: {
			polling: { extraHeaders: { Authorization: 'Bearer ' + localStorage.getItem('token') } },
		},
	})

export default socketChat
