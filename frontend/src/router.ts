import { createRouter, createWebHistory } from "vue-router";
import Player from './components/Player.vue'
import Login from './components/Login.vue'
import QrVerificate from './components/QrVerificate.vue'
import Settings from './components/Settings.vue'
import Players from './components/Players.vue'
import FriendList from './components/FriendList.vue'
import Chat from './components/Chat.vue'
import Game from './components/Game.vue'
import PathNotFound from './components/PathNotFound.vue'
import axios from "axios";

const router = createRouter({
	routes: [
		{ path: '/player', component: Player, name: 'Player'},
		{ path: '/player/:id', component: Player, name: 'PlayerOther'},
		{ path: '/login', component: Login, name: 'Login'},
		{ path: '/qrverificate', component: QrVerificate, name: 'QrVerificate'},
		{ path: '/settings', component: Settings, name: 'Settings' },
		{ path: '/players', component: Players, name: 'Players' },
		{ path: '/friendlist', component: FriendList, name: 'FriendList' },
		{ path: '/chat', component: Chat, name: 'Chat' },
		{ path: '/chat/:id', component: Chat, name: 'ChatDir' },
		{ path: '/game', component: Game, name: 'Game' },
		{ path: '/', redirect: '/player' },
		{ path: '/:pathMatch(.*)*', component: PathNotFound, name: 'PathNotFound' },
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
			return Player
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
			return Player
		}
	}
})

export default router
