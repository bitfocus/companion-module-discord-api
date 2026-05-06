import DiscordInstance, { Manifest } from './index.js'
import { CompanionVariableDefinitions } from '@companion-module/base'

type UserVariableValue = {
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

	voice_user_self: UserVariableValue | null
	voice_user_selected: UserVariableValue | null
	voice_users_by_index: UserVariableValue[]
	voice_users_by_id: { [key in string]: UserVariableValue }
	voice_users_by_nick: { [key in string]: UserVariableValue }
	voice_users_by_current_speaker: UserVariableValue[]

	video_camera_active?: boolean
	video_screen_share_active?: boolean

	// TODO: Pre-v3 deprecated variables
	voice_channel_id?: string
	voice_channel_name?: string
	voice_guild_id?: string
	voice_guild_name?: string
	voice_guild_icon?: string

	voice_connection_status?: string
	voice_connection_hostname?: string
	voice_connection_ping?: string
	voice_connection_ping_avg?: string
	voice_connection_ping_min?: string
	voice_connection_ping_max?: string

	voice_self_input_mode?: string
	voice_self_input_volume?: string
	voice_self_mic_active?: string
	voice_self_output_volume?: string

	voice_current_speaker_id?: string
	voice_current_speaker_nick?: string
	voice_current_speaker_number?: string

	voice_user_selected_id?: string

	// Dynamic pre-v3 variables (user-indexed)
	[key: `voice_user_${number | string}_${'nick' | 'volume' | 'mute' | 'deaf' | 'self_mute' | 'self_deaf' | 'speaking' | 'avatar'}`]: string
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
		const preV3 = this.instance.config.preV3 ? this.preV3Definitions() : {} // TODO: Pre-v3 deprecated variables definition

		this.instance.setVariableDefinitions({
			channel: { name: 'Information about the currently connected voice channel' },
			guild: { name: 'Information about the currently connected guild in a voice channel' },

			voice_connection: { name: 'Stats of the current connection' },
			voice_self: { name: 'Information about your voice parameters' },

			self: { name: 'Your ID' },
			user_selected: { name: 'ID of the selected user' },

			voice_user_self: { name: 'Information about yourself' },
			voice_user_selected: { name: 'Information about the selected user' },
			voice_users_by_index: { name: 'Information about users by index' },
			voice_users_by_id: { name: 'Information about users by ID' },
			voice_users_by_nick: { name: 'Information about users by nickname' },
			voice_users_by_current_speaker: { name: 'Information about currently speaking users' },

			video_camera_active: { name: 'If your camera is active' },
			video_screen_share_active: { name: 'If your screen share is active' },

			...preV3, // TODO: Pre-v3 deprecated variables definition
		})
	}

	/**
	 * @description Update variables
	 */
	public readonly updateVariables = (): void => {
		if (!this.instance.discord.data) return

		const voiceUsers: UserVariableValue[] = this.instance.discord.sortedVoiceUsers().map((vUser, index) => ({
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

		const preV3 = this.instance.config.preV3 ? this.preV3Content() : {} // TODO: Pre-v3 deprecated variables updating

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
					average: this.instance.discord.data.voiceStatus.last_ping != null ? Math.round(this.instance.discord.data.voiceStatus.average_ping) : -1,
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

			...preV3, // TODO: Pre-v3 deprecated variables updating
		})
	}

	// TODO: Pre-v3 deprecated variables definition
	private preV3Definitions(): Partial<CompanionVariableDefinitions<Manifest['variables']>> {
		const definitions: Partial<CompanionVariableDefinitions<Manifest['variables']>> = {
			voice_channel_id: { name: 'Voice channel id --- This variable is deprecated, please replace it by $(discord:channel)["id"] variable.' },
			voice_channel_name: { name: 'Voice channel name --- This variable is deprecated, please replace it by $(discord:channel)["name"] variable.' },
			voice_guild_id: { name: 'Voice guild id --- This variable is deprecated, please replace it by $(discord:guild)["id"] variable.' },
			voice_guild_name: { name: 'Voice guild name --- This variable is deprecated, please replace it by $(discord:guild)["name"] variable.' },
			voice_guild_icon: { name: 'Voice guild icon --- This variable is deprecated, please replace it by $(discord:guild)["icon"] variable.' },

			voice_connection_status: { name: 'Voice Connection Status --- This variable is deprecated, please replace it by $(discord:voice_connection)["status"] variable.' },
			voice_connection_hostname: {
				name: 'Voice Connection Hostname --- This variable is deprecated, please replace it by $(discord:voice_connection)["hostname"] variable.',
			},
			voice_connection_ping: {
				name: 'Voice Connection Ping --- This variable is deprecated, please replace it by $(discord:voice_connection)["ping"]["current"] variable.',
			},
			voice_connection_ping_avg: {
				name: 'Voice Connection Ping Avg --- This variable is deprecated, please replace it by $(discord:voice_connection)["ping"]["average"] variable.',
			},
			voice_connection_ping_min: {
				name: 'Voice Connection Ping Min --- This variable is deprecated, please replace it by $(discord:voice_connection)["ping"]["min"] variable.',
			},
			voice_connection_ping_max: {
				name: 'Voice Connection Ping Max --- This variable is deprecated, please replace it by $(discord:voice_connection)["ping"]["max"] variable.',
			},

			voice_self_input_mode: { name: 'Voice Self Input Mode --- This variable is deprecated, please replace it by $(discord:voice_self)["input_mode"] variable.' },
			voice_self_input_volume: { name: 'Voice Self Input Volume --- This variable is deprecated, please replace it by $(discord:voice_self)["input_volume"] variable.' },
			voice_self_mic_active: { name: 'Voice Self Mic Active --- This variable is deprecated, please replace it by $(discord:voice_self)["mic_active"] variable.' },
			voice_self_output_volume: {
				name: 'Voice Self Output Volume --- This variable is deprecated, please replace it by $(discord:voice_self)["output_volume"] variable.',
			},

			voice_current_speaker_id: {
				name: 'Voice Current Speaker ID --- This variable is deprecated, please replace it by $(discord:voice_users_by_current_speaker)["<index>"]["id"] or $(discord:voice_users_by_current_speaker)["0"]["id"] variable.',
			},
			voice_current_speaker_nick: {
				name: 'Voice Current Speaker Nick --- This variable is deprecated, please replace it by $(discord:voice_users_by_current_speaker)["<index>"]["nick"] variable.',
			},
			voice_current_speaker_number: {
				name: 'Voice Current Speaker Number --- This variable is deprecated, please replace it by $(discord:voice_users_by_current_speaker)["<index>"]["index"] variable.',
			},

			voice_user_selected_id: { name: 'Voice User Selected ID --- This variable is deprecated, please replace it by $(discord:voice_user_selected)["id"] variable.' },
			voice_user_selected_nick: {
				name: 'Voice User Selected Nick --- This variable is deprecated, please replace it by $(discord:voice_user_selected)["nick"] variable.',
			},
			voice_user_selected_volume: {
				name: 'Voice User Selected Volume --- This variable is deprecated, please replace it by $(discord:voice_user_selected)["volume"] variable.',
			},
		}

		// Add dynamic voice user variables
		const voiceUsers = this.instance.discord.sortedVoiceUsers() || []
		voiceUsers.forEach((voiceState: any, index: number) => {
			definitions[`voice_user_${index}_nick`] = {
				name: `Voice User ${index} Nick --- This variable is deprecated, please replace it by $(discord:voice_users_by_index)["${index}"]["nick"] variable.`,
			}
			definitions[`voice_user_${voiceState.user.id}_nick`] = {
				name: `Voice User ${voiceState.user.id} Nick --- This variable is deprecated, please replace it by $(discord:voice_users_by_id)["${voiceState.user.id}"]["nick"] variable.`,
			}
			;[index, voiceState.nick, voiceState.user.id].forEach((id) => {
				id = id + ''
				const safeID = id.replace(/[^a-z0-9-_.]+/gi, '')

				definitions[`voice_user_${safeID}_volume`] = {
					name: `Voice User ${id} Volume --- This variable is deprecated, please replace it by $(discord:voice_users_by_id)["${id}"]["volume"] or $(discord:voice_users_by_index)["${index}"]["volume"] variable.`,
				}
				definitions[`voice_user_${safeID}_mute`] = {
					name: `Voice User ${id} Mute --- This variable is deprecated, please replace it by $(discord:voice_users_by_id)["${id}"]["mute"] variable.`,
				}
				definitions[`voice_user_${safeID}_deaf`] = {
					name: `Voice User ${id} Deaf --- This variable is deprecated, please replace it by $(discord:voice_users_by_id)["${id}"]["deaf"] variable.`,
				}
				definitions[`voice_user_${safeID}_self_mute`] = {
					name: `Voice User ${id} Self Mute --- This variable is deprecated, please replace it by $(discord:voice_users_by_id)["${id}"]["self_mute"] variable.`,
				}
				definitions[`voice_user_${safeID}_self_deaf`] = {
					name: `Voice User ${id} Self Deaf --- This variable is deprecated, please replace it by $(discord:voice_users_by_id)["${id}"]["self_deaf"] variable.`,
				}
				definitions[`voice_user_${safeID}_speaking`] = {
					name: `Voice User ${id} Speaking --- This variable is deprecated, please replace it by $(discord:voice_users_by_id)["${id}"]["speaking"] variable.`,
				}
				definitions[`voice_user_${safeID}_avatar`] = {
					name: `Voice User ${id} Avatar --- This variable is deprecated, please replace it by $(discord:voice_users_by_id)["${id}"]["avatar"] variable.`,
				}
			})
		})

		return definitions
	}

	// TODO: Pre-v3 deprecated variables updating
	private preV3Content(): Partial<Manifest['variables']> {
		const content: Partial<Manifest['variables']> = {
			voice_channel_id: this.instance.discord.data?.voiceChannel?.id || '',
			voice_channel_name: this.instance.discord.data?.voiceChannel?.name || '',
			voice_guild_id: this.instance.discord.data?.voiceChannel?.guild_id || '',
			voice_guild_name: this.instance.discord.data?.guildNames.get(this.instance.discord.data?.voiceChannel?.guild_id || '') || '',
			voice_guild_icon: this.instance.discord.data?.guilds.find((e: any) => e.id === this.instance.discord.data?.voiceChannel?.guild_id)?.icon_url || '',

			voice_connection_status: this.instance.discord.data?.voiceStatus.state || '',
			voice_connection_hostname: this.instance.discord.data?.voiceStatus.hostname || '',
			voice_connection_ping: Math.round(this.instance.discord.data?.voiceStatus.last_ping ?? -1).toString(),
			voice_connection_ping_avg: (this.instance.discord.data?.voiceStatus.last_ping != null ? Math.round(this.instance.discord.data.voiceStatus.average_ping) : -1).toString(),
			voice_connection_ping_min: (this.instance.discord.data?.voiceStatus.pings.length > 0
				? Math.round(Math.min(...(this.instance.discord.data.voiceStatus.pings || []).map((ping: any) => ping.value)))
				: -1
			).toString(),
			voice_connection_ping_max: (this.instance.discord.data?.voiceStatus.pings.length > 0
				? Math.round(Math.max(...(this.instance.discord.data.voiceStatus.pings || []).map((ping: any) => ping.value)))
				: -1
			).toString(),

			voice_self_input_mode: this.instance.discord.data?.userVoiceSettings?.mode.type || '',
			voice_self_input_volume: (this.instance.discord.data?.userVoiceSettings?.input.volume || -1).toString(),
			voice_self_mic_active: (this.instance.discord.data?.speaking.has(this.instance.discord.client.user?.id) || false).toString(),
			voice_self_output_volume: (this.instance.discord.data?.userVoiceSettings?.output.volume || -1).toString(),
		}

		// Voice current speaker
		const currentSpeaker = Array.from(this.instance.discord.data?.delayedSpeaking || []).pop()
		if (typeof currentSpeaker === 'string') {
			const user = this.instance.discord.sortedVoiceUsers().find((voiceState: any) => voiceState.user.id === currentSpeaker)
			const userIndex = this.instance.discord.sortedVoiceUsers().findIndex((voiceState: any) => voiceState.user.id === currentSpeaker)

			content.voice_current_speaker_id = currentSpeaker || ''
			content.voice_current_speaker_nick = user?.nick || ''
			content.voice_current_speaker_number = userIndex?.toString() || ''
		} else {
			content.voice_current_speaker_id = ''
			content.voice_current_speaker_nick = ''
			content.voice_current_speaker_number = ''
		}

		// Voice user selected
		const selectedUser = this.instance.discord.sortedVoiceUsers().find((voiceState: any) => voiceState.user.id === this.instance.discord.data?.selectedUser)
		content.voice_user_selected_id = this.instance.discord.data?.selectedUser || ''
		content.voice_user_selected_nick = selectedUser?.nick || ''
		content.voice_user_selected_volume = (selectedUser?.volume || -1).toString()

		// Dynamic voice users variables
		const voiceUsers = this.instance.discord.sortedVoiceUsers() || []
		for (let i = 0; i < 200; i++) {
			content[`voice_user_${i}_nick`] = voiceUsers[i]?.nick || ''
		}

		voiceUsers.forEach((voiceState: any, index: number) => {
			content[`voice_user_${index}_nick`] = voiceState.nick
			content[`voice_user_${voiceState.user.id}_nick`] = voiceState.nick
			;[index, voiceState.nick, voiceState.user.id].forEach((id) => {
				const safeId = (id + '').replace(/[^a-z0-9-_.]+/gi, '')
				content[`voice_user_${safeId}_volume`] = voiceState.volume || -1
				content[`voice_user_${safeId}_mute`] = (voiceState.mute || false).toString()
				content[`voice_user_${safeId}_deaf`] = (voiceState.voice_state.deaf || false).toString()
				content[`voice_user_${safeId}_self_mute`] = (voiceState.voice_state.self_mute || false).toString()
				content[`voice_user_${safeId}_self_deaf`] = (voiceState.voice_state.self_deaf || false).toString()
				content[`voice_user_${safeId}_speaking`] = (this.instance.discord.data?.delayedSpeaking.has(voiceState.user.id) || false).toString()
				content[`voice_user_${safeId}_avatar`] = `https://cdn.discordapp.com/avatars/${voiceState.user.id || ''}/${voiceState.user.avatar || ''}.png`
			})
		})

		return content
	}
}
