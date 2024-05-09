import RPC from 'discord-rpc'
import DiscordInstance from './index'
import { DropdownChoice, InstanceStatus } from '@companion-module/base'

interface Application {
	id: string
	name: string
	icon: string
	description: string
	summary: string
	type: any
	hook: boolean
	terms_of_service_url: string
	privacy_policy_url: string
	verify_key: string
	tags: string[]
}

interface AudioDevice {
	id: string
	name: string
}

interface Channel {
	id: string
	guild_id: string
	name: string
	type: number
	topic?: string
	bitrate?: number
	user_imit?: number
	position: number
	voice_states?: VoiceState[]
	messages?: any[]
}

export interface ClientData {
	accessToken: null | string
	application: Partial<Application> | null
	baseURL: 'https://discord.com/api'
	channels: Channel[]
	guilds: Guild[]
	guildNames: Map<string, string>
	reconnectTimer: NodeJS.Timeout | null
	scopes: string[]
	selectedUser: string
	speaking: Set<string>
	delayedSpeaking: Set<string>
	delayedSpeakingTimers: {
		[key: string]: NodeJS.Timeout
	}
	subscriptions: Subscriptions
	user: any
	userVoiceSettings: null | VoiceSettings
	voiceChannel: null | VoiceChannel
	voiceStatus: VoiceConnectionStatus

	_destroying: boolean
	_expecting: Map<string, any>
	_connectPromise: Promise<any> | undefined
}

interface Guild {
	id: string
	name: string
	icon_url?: null | string
}

export interface RichPresence {
	state: string
	details: string
	largeImageKey?: string
	largeImageText?: string
	smallImageKey?: string
	smallImageText?: string
	startTimestamp?: Date
	endTimpestamp?: Date
}

interface Subscription {
	unsubscribe: () => Promise<any>
}

interface Subscriptions {
	SPEAKING_START: null | Subscription
	SPEAKING_STOP: null | Subscription
	VOICE_STATE_CREATE: null | Subscription
	VOICE_STATE_DELETE: null | Subscription
	VOICE_STATE_UPDATE: null | Subscription
}

interface VoiceChannel {
	id: string
	guild_id: string
	name: string
	type: number
	bitrate: number
	user_imit: number
	position: number
	voice_states: VoiceState[]
}

interface VoiceChannelSelectArgs {
	channel_id: string | null
	guild_id?: string
}

type VoiceConnectionState =
	| 'DISCONNECTED'
	| 'AWAITING_ENDPOINT'
	| 'AUTHENTICATING'
	| 'CONNECTING'
	| 'CONNECTED'
	| 'VOICE_DISCONNECTED'
	| 'VOICE_CONNECTING'
	| 'VOICE_CONNECTED'
	| 'NO_ROUTE'
	| 'ICE_CHECKING'

interface VoiceConnectionStatus {
	state: VoiceConnectionState
	hostname: string
	pings: { time: number; value: number }[]
	average_ping: number
	last_ping?: number
}

interface VoiceSettings {
	input: {
		available_devices: AudioDevice[]
		device_id: string
		volume: number
	}
	output: {
		available_devices: AudioDevice[]
		device_id: string
		volume: number
	}
	mode: {
		type: 'PUSH_TO_TALK' | 'VOICE_ACTIVITY'
		auto_threshold: boolean
		threshold: number
		shortcut: [
			{
				type: number
				code: number
				name: string
			}
		]
		delay: number
	}
	automatic_gain_control: boolean
	echo_cancellation: boolean
	noise_suppression: boolean
	qos: boolean
	silence_warning: boolean
	deaf: boolean
	mute: boolean
}

interface VoiceSettingsOther {
	mute?: boolean
	volume?: number
}

interface VoiceSpeaking {
	channel_id: string
	user_id: string
}

export interface VoiceState {
	nick: string
	mute: boolean
	volume: number
	pan: {
		left: number
		right: number
	}
	voice_state: {
		mute: boolean
		deaf: boolean
		self_mute: boolean
		self_deaf: boolean
		suppress: boolean
	}
	user: {
		id: string
		username: string
		discriminator: string
		avatar: string
		bot: boolean
		flags: number
		premium_type: number
	}
}

export const discordInit = async (instance: DiscordInstance): Promise<void> => {
	if (!instance.config.clientID || !instance.config.clientSecret) return

	// Client already exists
	if (instance.client) return

	instance.log('debug', 'Initializing Discord client')

	const client = new RPC.Client({ transport: 'ipc' })
	instance.client = client
	instance.clientData = {
		accessToken: null,
		application: null,
		baseURL: 'https://discord.com/api',
		channels: [],
		guilds: [],
		guildNames: new Map(),
		reconnectTimer: null,
		scopes: ['identify', 'rpc', 'rpc.voice.read', 'rpc.voice.write', 'guilds'],
		selectedUser: '',
		speaking: new Set(),
		delayedSpeaking: new Set(),
		delayedSpeakingTimers: {},
		subscriptions: {
			SPEAKING_START: null,
			SPEAKING_STOP: null,
			VOICE_STATE_CREATE: null,
			VOICE_STATE_DELETE: null,
			VOICE_STATE_UPDATE: null,
		},
		user: null,
		userVoiceSettings: null,
		voiceChannel: null,
		voiceStatus: { state: 'DISCONNECTED', hostname: '', pings: [], average_ping: 0 },
		_destroying: false,
		_expecting: new Map(),
		_connectPromise: undefined,
	}

	// Get channels for a specific guild
	const getChannels = async (id: string): Promise<Channel[]> => {
		//@ts-ignore
		const { channels } = await client.request('GET_CHANNELS', { guild_id: id })

		return channels.map((channel: Channel) => {
			return { ...channel, guild_id: id }
		})
	}

	// Loop through all guilds and get channel list
	const getChannelsAll = async (): Promise<Channel[]> => {
		let channels: Channel[] = []

		const getChannelsLoop = async (index: number): Promise<Channel[]> => {
			if (!instance.clientData.guilds[index]) return Promise.resolve(channels)

			channels = [...channels, ...(await getChannels(instance.clientData.guilds[index].id))]
			return await getChannelsLoop(index + 1)
		}

		return await getChannelsLoop(0)
	}

	// Get all joined guilds
	const getGuilds = async (): Promise<Guild[]> => {
		//@ts-ignore
		const { guilds } = await client.request('GET_GUILDS')

		return guilds
	}

	// Get channel details for current voice channel
	const getSelectedVoiceChannel = (): Promise<VoiceChannel | null> => {
		//@ts-ignore
		return client.request('GET_SELECTED_VOICE_CHANNEL')
	}

	// Get a user on the current voice channel
	const getUser = async (value: string): Promise<VoiceState | null> => {
		const userValue = await instance.parseVariablesInString(value)

		const user = instance.clientData.voiceChannel?.voice_states.find((user: VoiceState) => {
			const id = userValue.toLowerCase() === user.user.id
			const tag = userValue.toLowerCase() === `${user.user.username.toLowerCase()}#${user.user.discriminator}`
			const nick = userValue.toLowerCase() === user.nick.toLowerCase()
			const name = userValue.toLowerCase() === user.user.username.toLowerCase()

			return id || tag || nick || name
		})

		return user || null
	}
	instance.clientData.getUser = getUser

	// Get self voice settings
	const getVoiceSettings = (): Promise<VoiceSettings> => {
		//@ts-ignore
		return client.request('GET_VOICE_SETTINGS')
	}

	// Focuses Discord client on the specified Text Channel
	const selectTextChannel = (id: string): Promise<any> => {
		//@ts-ignore
		return client.request('SELECT_TEXT_CHANNEL', { channel_id: id })
	}
	instance.clientData.selectTextChannel = selectTextChannel

	// Joines or Parts a Voice Channel
	const selectVoiceChannel = (id: string | null, { timeout, force = false }: any = {}) => {
		//@ts-ignore
		return client.request('SELECT_VOICE_CHANNEL', { channel_id: id, timeout, force })
	}
	instance.clientData.selectVoiceChannel = selectVoiceChannel

	// Sets other users Voice Settings
	const setUserVoiceSettings = (id: string, settings: VoiceSettingsOther): Promise<any> => {
		//@ts-ignore
		return client.request('SET_USER_VOICE_SETTINGS', {
			user_id: id,
			mute: settings.mute,
			volume: settings.volume,
		})
	}
	instance.clientData.setUserVoiceSettings = setUserVoiceSettings

	// Sets self Voice Settings
	const setVoiceSettings = (selfVoiceSettings: Partial<VoiceSettings>): Promise<any> => {
		//@ts-ignore
		return client.request('SET_VOICE_SETTINGS', selfVoiceSettings).then((newVoiceSettings: VoiceSettings) => {
			instance.clientData.userVoiceSettings = newVoiceSettings
			instance.variables.updateVariables()
			instance.checkFeedbacks('selfMute', 'selfDeaf')
		})
	}
	instance.clientData.setVoiceSettings = setVoiceSettings

	// Returns alphabetically sorted list of Text Channels
	const sortedTextChannelChoices = (): DropdownChoice[] => {
		const choices: DropdownChoice[] = []

		instance.clientData.channels
			.filter((channel: Channel) => channel.type === 0)
			.forEach((channel: Channel) => {
				choices.push({
					id: channel.id,
					label: `${instance.clientData.guildNames.get(channel.guild_id)} - ${channel.name}`,
				})
			})

		choices.sort((a, b) => a.label.localeCompare(b.label))

		return choices
	}
	instance.clientData.sortedTextChannelChoices = sortedTextChannelChoices

	// Returns alphabetically sorted list of Voice Channels
	const sortedVoiceChannelChoices = (): DropdownChoice[] => {
		const choices: DropdownChoice[] = []

		instance.clientData.channels
			.filter((channel: Channel) => channel.type === 2)
			.forEach((channel: Channel) => {
				choices.push({
					id: channel.id,
					label: `${instance.clientData.guildNames.get(channel.guild_id)} - ${channel.name}`,
				})
			})

		choices.sort((a, b) => a.label.localeCompare(b.label))

		return choices
	}
	instance.clientData.sortedVoiceChannelChoices = sortedVoiceChannelChoices

	// Returns all users (and self) of current voice channel
	const sortedVoiceUsers = (): VoiceState[] => {
		if (!instance.clientData.voiceChannel?.voice_states) return []
		const voiceUsers = [...instance.clientData.voiceChannel.voice_states]

		voiceUsers.sort((a, b) => {
			return a.nick.localeCompare(b.nick) !== 0 ? a.nick.localeCompare(b.nick) : 0
		})

		return voiceUsers
	}
	instance.clientData.sortedVoiceUsers = sortedVoiceUsers

	// Gets full list of guilds and channels
	const updateChannelList = async (): Promise<void> => {
		instance.clientData.guilds = await getGuilds()
		instance.clientData.channels = await getChannelsAll()

		instance.clientData.guilds.forEach((guild: Guild) => {
			instance.clientData.guildNames.set(guild.id, guild.name)
		})

		instance.updateInstance()
		return
	}

	client.on('ready', async () => {
		instance.log('debug', 'discord client ready')
		instance.updateStatus(InstanceStatus.Ok)

		//@ts-ignore
		instance.clientData.access_token = client.accessToken

		const newConfig = { ...instance.config, accessToken: instance.clientData.access_token }
		instance.saveConfig(newConfig)
		await updateChannelList()
		instance.clientData.userVoiceSettings = await getVoiceSettings()
		//@ts-ignore
		const voiceChannel = await client.request('GET_SELECTED_VOICE_CHANNEL')

		if (voiceChannel !== null) {
			instance.clientData.voiceChannel = voiceChannel
			instance.clientData.voiceChannel!.voice_states.sort((a: VoiceState, b: VoiceState) => {
				if (a.nick < b.nick) return -1
				if (b.nick > a.nick) return 1
				return a.user.id < b.user.id ? -1 : 1
			})

			instance.clientData.subscriptions.SPEAKING_START = await client.subscribe('SPEAKING_START', {
				channel_id: voiceChannel.id,
			})
			instance.clientData.subscriptions.SPEAKING_STOP = await client.subscribe('SPEAKING_STOP', {
				channel_id: voiceChannel.id,
			})
			instance.clientData.subscriptions.VOICE_STATE_CREATE = await client.subscribe('VOICE_STATE_CREATE', {
				channel_id: voiceChannel.id,
			})
			instance.clientData.subscriptions.VOICE_STATE_DELETE = await client.subscribe('VOICE_STATE_DELETE', {
				channel_id: voiceChannel.id,
			})
			instance.clientData.subscriptions.VOICE_STATE_UPDATE = await client.subscribe('VOICE_STATE_UPDATE', {
				channel_id: voiceChannel.id,
			})
		}
		await client.subscribe('CHANNEL_CREATE', {})
		await client.subscribe('GUILD_CREATE', {})
		await client.subscribe('VOICE_CHANNEL_SELECT', {})
		await client.subscribe('VOICE_CONNECTION_STATUS', {})
		await client.subscribe('VOICE_SETTINGS_UPDATE', {})

		instance.variables.updateVariables()
		instance.checkFeedbacks('selfMute', 'selfDeaf', 'voiceChannel', 'voiceStyling')
	})

	client.on('disconnected', () => {
		instance.log('warn', 'discord client disconnected')
		instance.updateStatus(InstanceStatus.Disconnected)
	})

	client.on('error', (err) => {
		instance.log('error', JSON.stringify(err))
	})

	client.on('CHANNEL_CREATE', (_args: any) => {
		updateChannelList()
	})

	client.on('GUILD_CREATE', (_args: any) => {
		updateChannelList()
	})

	client.on('VOICE_CHANNEL_SELECT', async (data: VoiceChannelSelectArgs) => {
		if (data.channel_id !== null) {
			instance.clientData.voiceChannel = await getSelectedVoiceChannel()

			const options = { channel_id: data.channel_id }

			instance.clientData.subscriptions.SPEAKING_START = await client.subscribe('SPEAKING_START', options)
			instance.clientData.subscriptions.SPEAKING_STOP = await client.subscribe('SPEAKING_STOP', options)
			instance.clientData.subscriptions.VOICE_STATE_CREATE = await client.subscribe('VOICE_STATE_CREATE', options)
			instance.clientData.subscriptions.VOICE_STATE_DELETE = await client.subscribe('VOICE_STATE_DELETE', options)
			instance.clientData.subscriptions.VOICE_STATE_UPDATE = await client.subscribe('VOICE_STATE_UPDATE', options)
		} else {
			instance.clientData.voiceChannel = null
			instance.clientData.speaking.clear()

			// Unsubscribe to events after leaving the channel
			if (instance.clientData.subscriptions.SPEAKING_START !== null) {
				instance.clientData.subscriptions.SPEAKING_START.unsubscribe()
				instance.clientData.subscriptions.SPEAKING_START = null
			}

			if (instance.clientData.subscriptions.SPEAKING_STOP !== null) {
				instance.clientData.subscriptions.SPEAKING_STOP.unsubscribe()
				instance.clientData.subscriptions.SPEAKING_STOP = null
			}

			if (instance.clientData.subscriptions.VOICE_STATE_CREATE !== null) {
				instance.clientData.subscriptions.VOICE_STATE_CREATE.unsubscribe()
				instance.clientData.subscriptions.VOICE_STATE_CREATE = null
			}

			if (instance.clientData.subscriptions.VOICE_STATE_DELETE !== null) {
				instance.clientData.subscriptions.VOICE_STATE_DELETE.unsubscribe()
				instance.clientData.subscriptions.VOICE_STATE_DELETE = null
			}

			if (instance.clientData.subscriptions.VOICE_STATE_UPDATE !== null) {
				instance.clientData.subscriptions.VOICE_STATE_UPDATE.unsubscribe()
				instance.clientData.subscriptions.VOICE_STATE_UPDATE = null
			}
		}

		instance.variables.updateVariables()
		instance.checkFeedbacks('voiceChannel', 'voiceStyling')
	})

	client.on('VOICE_CONNECTION_STATUS', (args: VoiceConnectionStatus) => {
		instance.clientData.voiceStatus = args
		instance.variables.updateVariables()
	})

	// Triggers on changes to audio devices, volume, audio settings, etc...
	client.on('VOICE_SETTINGS_UPDATE', (voiceUserUpdate: VoiceSettings) => {
		instance.clientData.userVoiceSettings = voiceUserUpdate
		instance.variables.updateVariables()
		instance.checkFeedbacks('selfMute', 'selfDeaf', 'voiceStyling')
	})

	// Triggers when a user joins the voice channel
	client.on('VOICE_STATE_CREATE', (voiceState: VoiceState) => {
		if (instance.clientData.voiceChannel === null) return

		instance.clientData.voiceChannel.voice_states?.push(voiceState)
		instance.clientData.voiceChannel.voice_states?.sort((a: VoiceState, b: VoiceState) => {
			if (a.nick < b.nick) return -1
			if (b.nick > a.nick) return 1
			return a.user.id < b.user.id ? -1 : 1
		})

		instance.variables.updateVariables()
		instance.checkFeedbacks('voiceStyling')
	})

	// Triggers when a user leaves the voice channelTriggers
	client.on('VOICE_STATE_DELETE', (voiceState: VoiceState) => {
		if (instance.clientData.voiceChannel === null) return

		instance.clientData.voiceChannel!.voice_states = instance.clientData.voiceChannel?.voice_states?.filter(
			(voiceUser: VoiceState) => voiceUser.user.id !== voiceState.user.id
		)

		instance.variables.updateVariables()
		instance.checkFeedbacks('voiceStyling')
	})

	//  when a user on the voice channel changes voice state
	client.on('VOICE_STATE_UPDATE', (voiceState: VoiceState) => {
		if (instance.clientData.voiceChannel === null) return

		const index = instance.clientData.voiceChannel.voice_states.findIndex(
			(voiceUser: VoiceState) => voiceUser.user.id === voiceState.user.id
		)

		if (index !== -1) {
			instance.clientData.voiceChannel.voice_states[index] = voiceState
		} else {
			instance.clientData.voiceChannel.voice_states.push(voiceState)
			instance.clientData.voiceChannel.voice_states.sort((a: VoiceState, b: VoiceState) => {
				if (a.nick < b.nick) return -1
				if (b.nick > a.nick) return 1
				return a.user.id < b.user.id ? -1 : 1
			})
		}

		instance.variables.updateVariables()
		instance.checkFeedbacks('otherMute', 'otherDeaf', 'voiceStyling')
	})

	// Triggers when a user starts transmitting in the current channel
	client.on('SPEAKING_START', (args: VoiceSpeaking) => {
		instance.clientData.speaking.add(args.user_id)
		instance.variables.updateVariables()
		instance.checkFeedbacks('voiceStyling')
		instance.clientData.delayedSpeakingTimers[args.user_id] = setTimeout(() => {
			instance.clientData.delayedSpeaking.add(args.user_id)
			instance.variables.updateVariables()
		}, instance.config.speakerDelay || 0)
	})

	// Triggers when a user stops transmitting in the current channel
	client.on('SPEAKING_STOP', (args: VoiceSpeaking) => {
		instance.clientData.speaking.delete(args.user_id)
		instance.clientData.delayedSpeaking.delete(args.user_id)
		instance.variables.updateVariables()
		instance.checkFeedbacks('voiceStyling')
		if (instance.clientData.delayedSpeakingTimers[args.user_id])
			clearTimeout(instance.clientData.delayedSpeakingTimers[args.user_id])
	})

	const newLogin = async () => {
		await client
			.login({
				clientId: instance.config.clientID,
				clientSecret: instance.config.clientSecret,
				redirectUri: 'http://localhost',
				scopes: instance.clientData.scopes,
			})
			.catch((err) => {
				instance.log('warn', `Login err: ${JSON.stringify(err)}`)
				instance.updateStatus(InstanceStatus.ConnectionFailure)
			})
	}

	await client
		.login({
			accessToken: instance.config.accessToken,
			clientId: instance.config.clientID,
			clientSecret: instance.config.clientSecret,
			redirectUri: 'http://localhost',
			scopes: instance.clientData.scopes,
		})
		.catch((err) => {
			instance.log('debug', `Login err: ${JSON.stringify(err)}`)
			if (err?.code === 4009) {
				newLogin()
			} else {
				instance.updateStatus(InstanceStatus.ConnectionFailure)
			}
		})
}
