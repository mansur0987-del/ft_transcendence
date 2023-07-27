import { defineStore } from 'pinia'
import { io, Socket } from "socket.io-client"
import { ref } from "vue"

interface Notify {
	initiator_name?: string,
	initiator_id?: number,
	who_name?: string,
	who_id?: number
}

export const Store = defineStore('store', () => {
	let socketInvite : Socket
	let invitesGet = ref<Notify[]>([])
	let invitesSend = ref<Notify[]>([])

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

  return { invitesGet, invitesSend, GetSocketInvite, DisconnectSocketInvite }
})

