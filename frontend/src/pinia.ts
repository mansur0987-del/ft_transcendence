import { defineStore } from 'pinia'
import { io, Socket } from "socket.io-client"

export const Store = defineStore('store', () => {
	let socketInvite : Socket

	function GetSocketInvite(){
		if (!socketInvite){
			socketInvite = io(process.env.BASE_URL + 'invite', {
				transportOptions: {
					polling: { extraHeaders: { Authorization: 'Bearer ' + localStorage.getItem('token') } },
				},
			})
		}
		return socketInvite
	}

	function DisconnectSocketInvite(){
		if (socketInvite){
			socketInvite.disconnect()
		}
	}

  return { GetSocketInvite, DisconnectSocketInvite }
})
