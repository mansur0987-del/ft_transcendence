import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";

const router = createRouter({
	routes: [
		{
			path: '/player',
			component: () => import('./components/Player.vue'),
			name: 'Player'
		},
		{
			path: '/player/:id',
			component: () => import('./components/Player.vue'),
			name: 'PlayerOther'
		},
		{
			path: '/login',
			component: () => import('./components/Login.vue'),
			name: 'Login'
		},
		{
			path: '/qrverificate',
			component: () => import('./components/QrVerificate.vue'),
			name: 'QrVerificate'
		},
		{
			path: '/settings',
			component: () => import('./components/Settings.vue'),
			name: 'Settings'
		},
		{
			path: '/players',
			component: () => import('./components/Players.vue'),
			name: 'Players'
		},
		{
			path: '/friendlist',
			component: () => import('./components/FriendList.vue'),
			name: 'FriendList'
		},
		{
			path: '/chat',
			component: () => import('./components/Chat.vue'),
			name: 'Chat'
		},
		{
			path: '/chat/:room',
			component: () => import('./components/Chat.vue'),
			name: 'ChatDir'
		},
		{
			path: '/game',
			component: () => import('./components/Game.vue'),
			name: 'Game'
		},
		{
			path: '/game/:id',
			component: () => import('./components/Game.vue'),
			name: 'GameRoom'
		},
		{
			path: '/',
			redirect: '/player'
		},
		{
			path: '/:pathMatch(.*)*',
			component: () => import('./components/PathNotFound.vue'),
			name: 'PathNotFound'
		},
	],
	history: createWebHistory()
})

router.beforeEach(async (to, from) => {
	let status : number = 0
	await axios.get('auth/checkplayer')
	.then((res : any) => {
		if (res.data.isTwoFactorAuthenticationEnabled && !res.data.isLoginFactorAuthentication){
			status = 2
		}
	}).catch(() =>{
		status = 1
	})
	if (status === 0){
		if (to.name === 'Login' || to.name === 'QrVerificate'){
			return '/player'
		}
	}
	else if (status === 2){
		if (to.name !== 'QrVerificate'){
			return '/qrverificate'
		}
	}
	else if (status === 1){
		if (to.name !== 'Login'){
			return '/login'
		}
		else if (to.name === 'Login' && to.query.code !== undefined && to.query.code !== null){
			localStorage.setItem('token', to.query.code);
			axios.defaults.headers.common['Authorization'] = 'Bearer ' + to.query.code
			return '/player'
		}
	}
})

export default router
