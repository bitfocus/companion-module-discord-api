import DiscordInstance from './index.js'

type userVariableValue = {
	index: number
	id: string
	nick: string
	avatar: string
	mute: boolean
	deaf: boolean
	self_mute: boolean
	self_deaf: boolean
	speaking: boolean
	volume: number
}

export type VariableValue = {
	channel: { id: string | null; name: string | null }
	guild: { id: string | null; name: string | null; icon: string | null }

	voice_connection: { status: string; hostname: string | null; ping: { current: number; average: number; min: number; max: number } }
	voice_self: { input_mode: string | null; input_volume: number; output_volume: number; mic_active: boolean }

	self: string | null
	user_selected: string | null

	voice_user_self: userVariableValue | null
	voice_user_selected: userVariableValue | null
	voice_users_by_index: userVariableValue[]
	voice_users_by_id: { [key in string]: userVariableValue }
	voice_users_by_nick: { [key in string]: userVariableValue }
	voice_users_by_current_speaker: userVariableValue[]

	video_camera_active?: boolean
	video_screen_share_active?: boolean
}

export class Variables {
	private readonly instance: DiscordInstance

	constructor(instance: DiscordInstance) {
		this.instance = instance
	}

	/**
	 * @description Sets variable definitions
	 */
	public readonly updateDefinitions = (): void => {
		this.instance.setVariableDefinitions({
			channel: { name: 'Information of current connected voice channel' },
			guild: { name: 'Information of current connected guild in a voice channel' },

			voice_connection: { name: 'Stats of current current connection' },
			voice_self: { name: 'Informations about your voice parameters' },

			self: { name: 'Your id' },
			user_selected: { name: 'Id of selected user' },

			voice_user_self: { name: 'Informations about yourself' },
			voice_user_selected: { name: 'Informations about the selected user' },
			voice_users_by_index: { name: 'Informations about users by index' },
			voice_users_by_id: { name: 'Informations about users by ID' },
			voice_users_by_nick: { name: 'Informations about users by pseudo' },
			voice_users_by_current_speaker: { name: 'Users Informations of currently speakers' },

			video_camera_active: { name: 'If your camera is active' },
			video_screen_share_active: { name: 'If your screen share is active' },
		})
	}

	/**
	 * @description Update variables
	 */
	public readonly updateVariables = (): void => {
		if (!this.instance.discord.data) return

		const voiceUsers: userVariableValue[] = this.instance.discord.sortedVoiceUsers().map((vUser, index) => ({
			index,
			id: vUser.user.id,
			nick: vUser.nick,
			avatar: `https://cdn.discordapp.com/avatars/${vUser.user.id || ''}/${vUser.user.avatar || ''}.png`,
			mute: vUser.voice_state.mute,
			deaf: vUser.voice_state.deaf,
			self_mute: vUser.voice_state.self_mute,
			self_deaf: vUser.voice_state.self_deaf,
			speaking: this.instance.discord.data.delayedSpeaking.has(vUser.user.id),
			volume: vUser.volume,
		}))

		const self = voiceUsers.find((e) => e.id === this.instance.discord.client.user?.id)
		const selectedUser = voiceUsers.find((e) => e.id === this.instance.discord.data.selectedUser)

		this.instance.setVariableValues({
			channel: {
				id: this.instance.discord.data.voiceChannel?.id || null,
				name: this.instance.discord.data.voiceChannel?.name || null,
			},
			guild: {
				id: this.instance.discord.data.voiceChannel?.guild_id || null,
				name: this.instance.discord.data.guildNames.get(this.instance.discord.data.voiceChannel?.guild_id || '') || null,
				icon: this.instance.discord.data.guilds.find((e) => e.id === this.instance.discord.data.voiceChannel?.guild_id)?.icon_url || null,
			},

			voice_connection: {
				status: this.instance.discord.data.voiceStatus.state,
				hostname: this.instance.discord.data.voiceStatus.hostname,
				ping: {
					current: Math.round(this.instance.discord.data.voiceStatus.last_ping ?? -1),
					average: this.instance.discord.data.voiceStatus.last_ping ? Math.round(this.instance.discord.data.voiceStatus.average_ping) : -1,
					min: this.instance.discord.data.voiceStatus.pings.length > 0 ? Math.round(Math.min(...this.instance.discord.data.voiceStatus.pings.map((ping: any) => ping.value))) : -1,
					max: this.instance.discord.data.voiceStatus.pings.length > 0 ? Math.round(Math.max(...this.instance.discord.data.voiceStatus.pings.map((ping: any) => ping.value))) : -1,
				},
			},
			voice_self: {
				input_mode: this.instance.discord.data.userVoiceSettings?.mode.type || null,
				input_volume: this.instance.discord.data.userVoiceSettings?.input.volume || -1,
				output_volume: this.instance.discord.data.userVoiceSettings?.output.volume || -1,
				mic_active: this.instance.discord.data.speaking.has(this.instance.discord.client.user?.id),
			},

			self: self?.id ?? null,
			user_selected: selectedUser?.id ?? null,

			voice_user_self: self ?? null,
			voice_user_selected: selectedUser ?? null,
			voice_users_by_index: voiceUsers,
			voice_users_by_id: voiceUsers.reduce((obj, user) => ({ ...obj, [user.id]: user }), {}),
			voice_users_by_nick: voiceUsers.reduce((obj, user) => ({ ...obj, [user.nick]: user }), {}),
			voice_users_by_current_speaker: voiceUsers.filter((e) => e.speaking),

			video_camera_active: this.instance.discord.data.videoActive,
			video_screen_share_active: this.instance.discord.data.screenShareActive,
		})
	}
}
