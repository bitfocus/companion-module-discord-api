import { Client, type Application, type Channel, type Guild, type VoiceSettings, type VoiceState } from '@distdev/discord-ipc'
import type DiscordInstance from './index'
import { type DropdownChoice, InstanceStatus } from '@companion-module/base'

export interface ClientData {
	accessToken: null | string
	refreshToken: null | string
	application: Partial<Application> | null
	baseURL: 'https://discord.com/api'
	channels: Partial<Channel>[]
	guilds: Partial<Guild>[]
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
	voiceChannel: null | Channel
	voiceStatus: VoiceConnectionStatus

	_destroying: boolean
	_expecting: Map<string, any>
	_connectPromise: Promise<any> | undefined
}

export interface RichPresence {
	state: string
	details: string
	largeImageKey?: string
	largeImageText?: string
	smallImageKey?: string
	smallImageText?: string
	buttons?: { label: string; url: string }[]
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

interface VoiceSpeaking {
	channel_id: string
	user_id: string
}

export class Discord {
	client = new Client()
	data: ClientData = {
		accessToken: null,
		refreshToken: null,
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
	instance: DiscordInstance
	initialized = false

	constructor(instance: DiscordInstance) {
		this.instance = instance
	}

	init = async (): Promise<void> => {
		if (this.initialized) return
		this.initialized = true
		this.instance.log('debug', 'Initializing Discord client')
		this.initListeners()

		// New login attempt without OAuth tokens
		const newLogin = async () => {
			await this.client
				.login({
					clientId: this.instance.config.clientID,
					clientSecret: this.instance.config.clientSecret,
					redirectUri: 'http://localhost',
					scopes: this.data.scopes,
				})
				.catch((err) => {
					this.instance.log('warn', `Login err: ${JSON.stringify(err)}`)
					this.instance.updateStatus(InstanceStatus.ConnectionFailure)
				})
		}

		await this.client
			.login({
				accessToken: this.instance.config.accessToken,
				refreshToken: this.instance.config.refreshToken,
				clientId: this.instance.config.clientID,
				clientSecret: this.instance.config.clientSecret,
				redirectUri: 'http://localhost',
				scopes: this.data.scopes,
			})
			.catch((err) => {
				this.instance.log('debug', `Login err: ${JSON.stringify(err)}`)
				if (err?.code === 4009) {
					newLogin()
				} else {
					this.instance.updateStatus(InstanceStatus.ConnectionFailure)
				}
			})
	}

	initListeners = (): void => {
		const readyEvent = async () => {
			this.instance.log('debug', 'discord client ready')
			this.instance.updateStatus(InstanceStatus.Ok)

			this.data.accessToken = this.client.accessToken
			this.data.refreshToken = this.client.refreshToken

			const newConfig = { ...this.instance.config, accessToken: this.client.accessToken as string, refreshToken: this.client.refreshToken as string }
			this.instance.saveConfig(newConfig)

			await this.updateChannelList()
			this.data.userVoiceSettings = await this.client.getVoiceSettings()

			await this.createVoiceSusbcriptions()
			await this.client.subscribe('CHANNEL_CREATE', {})
			await this.client.subscribe('GUILD_CREATE', {})
			await this.client.subscribe('VOICE_CHANNEL_SELECT', {})
			await this.client.subscribe('VOICE_CONNECTION_STATUS', {})
			await this.client.subscribe('VOICE_SETTINGS_UPDATE', {})

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks()
		}

		const voiceChannelSelectEvent = async (data: VoiceChannelSelectArgs) => {
			if (data.channel_id !== null) {
				await this.clearVoiceSubscriptions()
				await this.createVoiceSusbcriptions()
			} else {
				await this.clearVoiceSubscriptions()
			}

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks()
		}

		const voiceStateDeleteEvent = async (voiceState: VoiceState) => {
			if (this.data.voiceChannel === null) return

			if (voiceState.user.id === this.client?.user.id) {
				const currentChannel = await this.client.getSelectedVoiceChannel()
				if (currentChannel!.id !== this.data.voiceChannel.id) {
					await this.clearVoiceSubscriptions()
					await this.createVoiceSusbcriptions()
				}
			}

			this.data.voiceChannel.voice_states = this.data.voiceChannel?.voice_states?.filter((voiceUser: VoiceState) => voiceUser.user.id !== voiceState.user.id)

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks()
		}

		const voiceStateUpdateEvent = async (voiceState: VoiceState) => {
			if (this.data.voiceChannel === null) return

			const index = this.data.voiceChannel.voice_states?.findIndex((voiceUser: VoiceState) => voiceUser.user.id === voiceState.user.id)
			if (index === undefined || this.data.voiceChannel.voice_states === undefined) return

			if (index !== -1) {
				this.data.voiceChannel.voice_states[index] = voiceState
			} else {
				this.data.voiceChannel.voice_states.push(voiceState)
				this.data.voiceChannel.voice_states.sort((a: VoiceState, b: VoiceState) => {
					if (a.nick < b.nick) return -1
					if (b.nick > a.nick) return 1
					return a.user.id < b.user.id ? -1 : 1
				})
			}

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks()
		}

		this.client.on('ready', () => {
			readyEvent()
		})

		this.client.on('disconnected', () => {
			this.instance.log('warn', 'discord client disconnected')
			this.instance.updateStatus(InstanceStatus.Disconnected)
		})

		this.client.on('error', (err) => {
			this.instance.log('error', JSON.stringify(err))
		})

		this.client.on('CHANNEL_CREATE', (args: any) => {
			this.instance.log('debug', `Event: CHANNEL_CREATE - ${JSON.stringify(args)}`)
		})

		this.client.on('GUILD_CREATE', (args: any) => {
			this.instance.log('debug', `Event: GUILD_CREATE - ${JSON.stringify(args)}`)
			this.updateChannelList()
		})

		this.client.on('VOICE_CHANNEL_SELECT', (data: VoiceChannelSelectArgs) => {
			this.instance.log('debug', `Event: VOICE_CHANNEL_SELECT - ${JSON.stringify(data)}`)
			voiceChannelSelectEvent(data)
		})

		this.client.on('VOICE_CONNECTION_STATUS', (args: VoiceConnectionStatus) => {
			this.instance.log('debug', `Event: VOICE_CONNECTION_STATUS - ${JSON.stringify(args)}`)
			this.data.voiceStatus = args
			this.instance.variables.updateVariables()
		})

		// Triggers on changes to audio devices, volume, audio settings, etc...
		this.client.on('VOICE_SETTINGS_UPDATE', (voiceUserUpdate: VoiceSettings) => {
			this.instance.log('debug', `Event: VOICE_SETTINGS_UPDATE - ${JSON.stringify(voiceUserUpdate)}`)
			this.data.userVoiceSettings = voiceUserUpdate
			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('selfMute', 'selfDeaf', 'voiceStyling')
		})

		// Triggers when a user joins the voice channel
		this.client.on('VOICE_STATE_CREATE', (voiceState: VoiceState) => {
			this.instance.log('debug', `Event: VOICE_STATE_CREATE - ${JSON.stringify(voiceState)}`)
			if (this.data.voiceChannel === null) return

			this.data.voiceChannel.voice_states?.push(voiceState)
			this.data.voiceChannel.voice_states?.sort((a: VoiceState, b: VoiceState) => {
				if (a.nick < b.nick) return -1
				if (b.nick > a.nick) return 1
				return a.user.id < b.user.id ? -1 : 1
			})

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('voiceStyling')
		})

		// Triggers when a user leaves the voice channelTriggers
		this.client.on('VOICE_STATE_DELETE', (voiceState: VoiceState) => {
			this.instance.log('debug', `Event: VOICE_STATE_DELETE - ${JSON.stringify(voiceState)}`)
			voiceStateDeleteEvent(voiceState)
		})

		//  when a user on the voice channel changes voice state
		this.client.on('VOICE_STATE_UPDATE', (voiceState: VoiceState) => {
			this.instance.log('debug', `Event: VOICE_STATE_UPDATE - ${JSON.stringify(voiceState)}`)
			voiceStateUpdateEvent(voiceState)
		})

		// Triggers when a user starts transmitting in the current channel
		this.client.on('SPEAKING_START', (args: VoiceSpeaking) => {
			this.data.speaking.add(args.user_id)
			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('voiceStyling')

			this.data.delayedSpeakingTimers[args.user_id] = setTimeout(() => {
				this.data.delayedSpeaking.add(args.user_id)
				this.instance.variables.updateVariables()
			}, this.instance.config.speakerDelay || 0)
		})

		// Triggers when a user stops transmitting in the current channel
		this.client.on('SPEAKING_STOP', (args: VoiceSpeaking) => {
			this.data.speaking.delete(args.user_id)
			this.data.delayedSpeaking.delete(args.user_id)
			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('voiceStyling')

			if (this.data.delayedSpeakingTimers[args.user_id]) clearTimeout(this.data.delayedSpeakingTimers[args.user_id])
		})
	}

	// Get channels for a specific guild
	getChannels = async (id: string): Promise<Partial<Channel>[]> => {
		const channels = await this.client.getChannels(id)

		return channels.map((channel) => {
			return { ...channel, guild_id: id }
		})
	}

	// Get all channels for all guilds
	getChannelsAll = async (): Promise<Partial<Channel>[]> => {
		const channels: Partial<Channel>[] = []

		for (const guild of this.data.guilds) {
			const guildChannels = await this.getChannels(guild.id as string)
			channels.push(...guildChannels)
		}

		return channels
	}

	// Gets full list of guilds and channels
	updateChannelList = async (): Promise<void> => {
		this.data.guilds = await this.client.getGuilds()
		this.data.channels = await this.getChannelsAll()

		this.data.guilds.forEach((guild) => {
			this.data.guildNames.set(guild.id as string, guild.name as string)
		})

		this.instance.updateInstance()
		return
	}

	// Create subscriptions to Voice Channel topics
	createVoiceSusbcriptions = async (): Promise<void> => {
		const voiceChannel = await this.client.getSelectedVoiceChannel()

		if (voiceChannel !== null) {
			this.instance.log('debug', 'Creating voice subscriptions')

			this.data.voiceChannel = voiceChannel
			this.data.voiceChannel.voice_states?.sort((a: VoiceState, b: VoiceState) => {
				if (a.nick < b.nick) return -1
				if (b.nick > a.nick) return 1
				return a.user.id < b.user.id ? -1 : 1
			})

			this.data.subscriptions.SPEAKING_START = await this.client.subscribe('SPEAKING_START', { channel_id: voiceChannel.id })
			this.data.subscriptions.SPEAKING_STOP = await this.client.subscribe('SPEAKING_STOP', { channel_id: voiceChannel.id })
			this.data.subscriptions.VOICE_STATE_CREATE = await this.client.subscribe('VOICE_STATE_CREATE', { channel_id: voiceChannel.id })
			this.data.subscriptions.VOICE_STATE_DELETE = await this.client.subscribe('VOICE_STATE_DELETE', { channel_id: voiceChannel.id })
			this.data.subscriptions.VOICE_STATE_UPDATE = await this.client.subscribe('VOICE_STATE_UPDATE', { channel_id: voiceChannel.id })
		}
	}

	// Clear subscriptions to Voice Channel topics
	clearVoiceSubscriptions = async (): Promise<void> => {
		this.instance.log('debug', 'Clearing voice subscriptions')
		this.data.voiceChannel = null
		this.data.speaking.clear()

		if (this.data.subscriptions.SPEAKING_START !== null) {
			await this.data.subscriptions.SPEAKING_START.unsubscribe()
			this.data.subscriptions.SPEAKING_START = null
		}

		if (this.data.subscriptions.SPEAKING_STOP !== null) {
			await this.data.subscriptions.SPEAKING_STOP.unsubscribe()
			this.data.subscriptions.SPEAKING_STOP = null
		}

		if (this.data.subscriptions.VOICE_STATE_CREATE !== null) {
			await this.data.subscriptions.VOICE_STATE_CREATE.unsubscribe()
			this.data.subscriptions.VOICE_STATE_CREATE = null
		}

		if (this.data.subscriptions.VOICE_STATE_DELETE !== null) {
			await this.data.subscriptions.VOICE_STATE_DELETE.unsubscribe()
			this.data.subscriptions.VOICE_STATE_DELETE = null
		}

		if (this.data.subscriptions.VOICE_STATE_UPDATE !== null) {
			await this.data.subscriptions.VOICE_STATE_UPDATE.unsubscribe()
			this.data.subscriptions.VOICE_STATE_UPDATE = null
		}
	}

	// Gets a specific user
	getUser = async (value: string): Promise<VoiceState | null> => {
		const userValue = await this.instance.parseVariablesInString(value)

		const user = this.sortedVoiceUsers().find((user: VoiceState, index: number) => {
			const id = userValue.toLowerCase() === user.user.id
			const name = userValue.toLowerCase() === user.user.username.toLowerCase()
			const nick = user.user.global_name ? userValue.toLowerCase() === user.user.global_name.toLowerCase() : false
			const indexCheck = !isNaN(parseInt(userValue, 10)) && parseInt(userValue, 10) === index

			return id || name || nick || indexCheck
		})

		return user || null
	}

	// Updates Self Voice Settings
	setVoiceSettings = async (selfVoiceSettings: Partial<VoiceSettings>): Promise<any> => {
		return this.client.setVoiceSettings(selfVoiceSettings).then((newVoiceSettings: VoiceSettings) => {
			this.data.userVoiceSettings = newVoiceSettings
			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('selfMute', 'selfDeaf')
		})
	}

	// Sort text channels by guild name
	sortedTextChannelChoices = (): DropdownChoice[] => {
		const choices: DropdownChoice[] = []

		this.data.channels
			.filter((channel) => channel.type === 0)
			.forEach((channel) => {
				choices.push({
					id: channel.id as string,
					label: `${this.data.guildNames.get(channel.guild_id as string)} - ${channel.name}`,
				})
			})

		choices.sort((a, b) => a.label.localeCompare(b.label))

		return choices
	}

	// Sort voice channels by guild name
	sortedVoiceChannelChoices = (): DropdownChoice[] => {
		const choices: DropdownChoice[] = []

		this.data.channels
			.filter((channel) => channel.type === 2)
			.forEach((channel) => {
				choices.push({
					id: channel.id as string,
					label: `${this.data.guildNames.get(channel.guild_id as string)} - ${channel.name}`,
				})
			})

		choices.sort((a, b) => a.label.localeCompare(b.label))

		return choices
	}

	// Sort voice users in current channel by nickname
	sortedVoiceUsers = (): VoiceState[] => {
		if (!this.data.voiceChannel?.voice_states) return []
		const voiceUsers = [...this.data.voiceChannel.voice_states]

		voiceUsers.sort((a, b) => {
			return a.nick.localeCompare(b.nick) !== 0 ? a.nick.localeCompare(b.nick) : 0
		})

		return voiceUsers
	}
}
