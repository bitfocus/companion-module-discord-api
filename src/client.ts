import EventEmitter from 'events'
import got from 'got-cjs'
import { DropdownChoice } from '../../../instance_skel_types'
import { createUUID } from './utils'
import { IPCTransport } from './ipc'
import DiscordInstance from './index'

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

type Commands =
	| 'DISPATCH'
	| 'AUTHORIZE'
	| 'AUTHENTICATE'
	| 'GET_GUILD'
	| 'GET_GUILDS'
	| 'GET_CHANNEL'
	| 'GET_CHANNELS'
	| 'SUBSCRIBE'
	| 'UNSUBSCRIBE'
	| 'SET_USER_VOICE_SETTINGS'
	| 'SELECT_VOICE_CHANNEL'
	| 'GET_SELECTED_VOICE_CHANNEL'
	| 'SELECT_TEXT_CHANNEL'
	| 'GET_VOICE_SETTINGS'
	| 'SET_VOICE_SETTINGS'
	| 'SET_CERTIFIED_DEVICES'
	| 'SET_ACTIVITY'
	| 'SEND_ACTIVITY_JOIN_INVITE'
	| 'CLOSE_ACTIVITY_REQUEST'

type Events =
	| 'READY'
	| 'ERROR'
	| 'GUILD_STATUS'
	| 'GUILD_CREATE'
	| 'CHANNEL_CREATE'
	| 'VOICE_CHANNEL_SELECT'
	| 'VOICE_STATE_CREATE'
	| 'VOICE_STATE_UPDATE'
	| 'VOICE_STATE_DELETE'
	| 'VOICE_SETTINGS_UPDATE'
	| 'VOICE_CONNECTION_STATUS'
	| 'SPEAKING_START'
	| 'SPEAKING_STOP'
	| 'MESSAGE_CREATE'
	| 'MESSAGE_UPDATE'
	| 'MESSAGE_DELETE'
	| 'NOTIFICATION_CREATE'
	| 'ACTIVITY_JOIN'
	| 'ACTIVITY_SPECTATE'
	| 'ACTIVITY_JOIN_REQUEST'

interface Guild {
	id: string
	name: string
	icon_url?: null | string
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

interface Tokens {
	access_token: string
	token_type: string
	expires_in: number
	refresh_token: string
	scope: string
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

interface VoiceState {
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

class RPCClient extends EventEmitter {
	constructor(instance: DiscordInstance) {
		super()

		this.instance = instance

		this.IPC = new IPCTransport(this)
		this.IPC.on('message', this.rpcMessage)
	}

	accessToken: null | string = null
	application: Partial<Application> | null = null
	baseURL = 'https://discord.com/api'
	channels: Channel[] = []
	guilds: Guild[] = []
	guildNames: Map<string, string> = new Map()
	instance: DiscordInstance
	IPC: IPCTransport
	reconnectTimer: NodeJS.Timeout | null = null
	scopes: string[] = ['rpc', 'rpc.voice.read', 'rpc.voice.write']
	selectedUser = ''
	speaking: Set<string> = new Set()
	subscriptions: Subscriptions = {
		SPEAKING_START: null,
		SPEAKING_STOP: null,
		VOICE_STATE_CREATE: null,
		VOICE_STATE_DELETE: null,
		VOICE_STATE_UPDATE: null,
	}
	user: any = null
	userVoiceSettings: null | VoiceSettings = null
	voiceChannel: null | VoiceChannel = null
	voiceStatus: VoiceConnectionStatus = { state: 'DISCONNECTED', hostname: '', pings: [], average_ping: 0 }

	_destroying = false
	_expecting = new Map()
	_connectPromise: Promise<any> | undefined = undefined

	// Star connection, auth, and start event listeners
	public init = async (): Promise<void> => {
		this.instance.status(this.instance.STATUS_WARNING, 'Connecting')

		await this.destroy()
		try {
			await this.connect()
		} catch (err: any) {
			this.instance.log('warn', err.message)
			this.IPC.socket?.destroy()

			if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
			this.reconnectTimer = setTimeout(this.init, 5000)
			return
		}
	}

	private initAuth = async () => {
		const refreshToken = this.instance.config.refreshToken
		let tokens: Tokens | null = null

		if (refreshToken) tokens = await this.refreshTokens(refreshToken)
		if (tokens === null) tokens = await this.authorize()

		this.instance.config.refreshToken = tokens.refresh_token
		this.instance.saveConfig()

		await this.authenticate(tokens.access_token)
		await this.updateChannelList()
		this.userVoiceSettings = await this.getVoiceSettings()

		const voiceChannel = await this.getSelectedVoiceChannel()

		if (voiceChannel !== null) {
			this.voiceChannel = voiceChannel
			this.voiceChannel!.voice_states.sort((a, b) => {
				if (a.nick < b.nick) return -1
				if (b.nick > a.nick) return 1
				return a.user.id < b.user.id ? -1 : 1
			})

			this.subscriptions.SPEAKING_START = await this.subscribe('SPEAKING_START', { channel_id: voiceChannel.id })
			this.subscriptions.SPEAKING_STOP = await this.subscribe('SPEAKING_STOP', { channel_id: voiceChannel.id })
			this.subscriptions.VOICE_STATE_CREATE = await this.subscribe('VOICE_STATE_CREATE', {
				channel_id: voiceChannel.id,
			})
			this.subscriptions.VOICE_STATE_DELETE = await this.subscribe('VOICE_STATE_DELETE', {
				channel_id: voiceChannel.id,
			})
			this.subscriptions.VOICE_STATE_UPDATE = await this.subscribe('VOICE_STATE_UPDATE', {
				channel_id: voiceChannel.id,
			})
		}

		this.initListeners()

		// Initial subscriptions that are global
		this.subscribe('CHANNEL_CREATE')
		this.subscribe('GUILD_CREATE')
		this.subscribe('VOICE_CHANNEL_SELECT')
		this.subscribe('VOICE_CONNECTION_STATUS')
		this.subscribe('VOICE_SETTINGS_UPDATE')

		this.instance.variables.updateVariables()
		this.instance.checkFeedbacks('selfMute', 'selfDeaf', 'voiceChannel', 'voiceStyling')
		this.instance.status(this.instance.STATUS_OK, 'OK')
	}

	// Uses Access Token to authenticate with Discord client
	private authenticate = (accessToken: string) => {
		return this.request('AUTHENTICATE', { access_token: accessToken }).then(({ application, user }: any) => {
			this.accessToken = accessToken
			this.application = application
			this.user = user

			this.emit('ready')

			return this
		})
	}

	// Authenticates app with users Discord client and exchanges code for Access Token and Refresh Token
	private authorize = async (): Promise<Tokens> => {
		const { code }: any = await this.request('AUTHORIZE', {
			scopes: this.scopes,
			client_id: this.instance.config.clientID,
		})

		const response: Tokens = await got
			.post(`${this.baseURL}/oauth2/token`, {
				form: {
					client_id: this.instance.config.clientID,
					client_secret: this.instance.config.clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: 'http://localhost',
				},
			})
			.json()

		return response
	}

	// Establish connection with Discord
	private connect = async (): Promise<void> => {
		this.once('connected', () => {
			this.instance.log('debug', 'Client connected')
			this.initAuth()

			//this.initListeners()
		})

		this.on('disconnected', () => {
			this.instance.log('debug', 'Client disconnected')
			this.instance.status(this.instance.STATUS_ERROR, 'Disconnected')
		})

		this.IPC.on('disconnected', () => {
			this.instance.log('debug', 'Client IPCdisconnected')
			this.instance.status(this.instance.STATUS_ERROR, 'Disconnected')
		})

		this.IPC.once('close', (err) => {
			this.instance.log('debug', `IPC close ${JSON.stringify(err)}`)
			this.instance.status(this.instance.STATUS_ERROR, 'Disconnected')

			//if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
			//this.reconnectTimer = setTimeout(this.init, 5000)
		})

		return await this.IPC.connect().catch((err) => {
			this.instance.log('warn', ' Discord Disconnected - Disable and Enable the discord instance to reconnect')
			this.instance.log('debug', `Client IPC Connect err - ${JSON.stringify(err)}`)
			this.instance.status(this.instance.STATUS_ERROR, 'Disconnected')

			this.removeAllListeners()
			this.IPC.socket?.destroy()

			//if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
			//this.reconnectTimer = setTimeout(this.init, 5000)
		})
	}

	// Close connection
	public destroy = async (): Promise<any> => {
		this._destroying = true
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
		await this.IPC.close()
	}

	// Get channels for a specific guild
	private getChannels = async (id: string): Promise<Channel[]> => {
		const { channels } = await this.request('GET_CHANNELS', { guild_id: id })

		return channels.map((channel: Channel) => {
			return { ...channel, guild_id: id }
		})
	}

	// Loop through all guilds and get channel list
	private getChannelsAll = async (): Promise<Channel[]> => {
		let channels: Channel[] = []

		const getChannelsLoop = async (index: number): Promise<Channel[]> => {
			if (!this.guilds[index]) return Promise.resolve(channels)

			channels = [...channels, ...(await this.getChannels(this.guilds[index].id))]
			return await getChannelsLoop(index + 1)
		}

		return await getChannelsLoop(0)
	}

	// Get channel details for current voice channel
	private getSelectedVoiceChannel = (): Promise<VoiceChannel | null> => {
		return this.request('GET_SELECTED_VOICE_CHANNEL')
	}

	// Get all joined guilds
	private getGuilds = async (): Promise<Guild[]> => {
		const { guilds } = await this.request('GET_GUILDS')

		return guilds
	}

	// Get a user on the current voice channel
	public getUser = (value: string): VoiceState | null => {
		let userValue = value

		this.instance.parseVariables(value, (parsed) => {
			if (parsed) userValue = parsed
		})

		const user = this.voiceChannel?.voice_states.find((user) => {
			const id = userValue.toLowerCase() === user.user.id
			const tag = userValue.toLowerCase() === `${user.user.username.toLowerCase()}#${user.user.discriminator}`
			const nick = userValue.toLowerCase() === user.nick.toLowerCase()
			const name = userValue.toLowerCase() === user.user.username.toLowerCase()

			return id || tag || nick || name
		})

		return user || null
	}

	// Get self voice settings
	private getVoiceSettings = (): Promise<VoiceSettings> => {
		return this.request('GET_VOICE_SETTINGS')
	}

	// Event listeners
	private initListeners = (): void => {
		// Triggers when joining or leaving a voice channel
		this.removeAllListeners('VOICE_CHANNEL_SELECT')
		this.on('VOICE_CHANNEL_SELECT', async (data: VoiceChannelSelectArgs) => {
			if (data.channel_id !== null) {
				this.voiceChannel = await this.getSelectedVoiceChannel()

				this.subscriptions.SPEAKING_START = await this.subscribe('SPEAKING_START', { channel_id: data.channel_id })
				this.subscriptions.SPEAKING_STOP = await this.subscribe('SPEAKING_STOP', { channel_id: data.channel_id })
				this.subscriptions.VOICE_STATE_CREATE = await this.subscribe('VOICE_STATE_CREATE', {
					channel_id: data.channel_id,
				})
				this.subscriptions.VOICE_STATE_DELETE = await this.subscribe('VOICE_STATE_DELETE', {
					channel_id: data.channel_id,
				})
				this.subscriptions.VOICE_STATE_UPDATE = await this.subscribe('VOICE_STATE_UPDATE', {
					channel_id: data.channel_id,
				})
			} else {
				this.voiceChannel = null
				this.speaking.clear()

				// Unsubscribe to events after leaving the channel
				if (this.subscriptions.SPEAKING_START !== null) {
					this.subscriptions.SPEAKING_START.unsubscribe()
					this.subscriptions.SPEAKING_START = null
				}

				if (this.subscriptions.SPEAKING_STOP !== null) {
					this.subscriptions.SPEAKING_STOP.unsubscribe()
					this.subscriptions.SPEAKING_STOP = null
				}

				if (this.subscriptions.VOICE_STATE_CREATE !== null) {
					this.subscriptions.VOICE_STATE_CREATE.unsubscribe()
					this.subscriptions.VOICE_STATE_CREATE = null
				}

				if (this.subscriptions.VOICE_STATE_DELETE !== null) {
					this.subscriptions.VOICE_STATE_DELETE.unsubscribe()
					this.subscriptions.VOICE_STATE_DELETE = null
				}

				if (this.subscriptions.VOICE_STATE_UPDATE !== null) {
					this.subscriptions.VOICE_STATE_UPDATE.unsubscribe()
					this.subscriptions.VOICE_STATE_UPDATE = null
				}
			}

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('voiceChannel', 'voiceStyling')
		})

		// Triggers on a channel being created
		this.removeAllListeners('CHANNEL_CREATE')
		this.on('CHANNEL_CREATE', (_args: any) => {
			this.updateChannelList()
		})

		// Triggers on joining or create a Discord server
		this.removeAllListeners('GUILD_CREATE')
		this.on('GUILD_CREATE', (_args: any) => {
			this.updateChannelList()
		})

		// Triggers during different stages of connection/disconnection to a voice channel, and periodically while connected
		this.removeAllListeners('VOICE_CONNECTION_STATUS')
		this.on('VOICE_CONNECTION_STATUS', (args: VoiceConnectionStatus) => {
			this.voiceStatus = args
			this.instance.variables.updateVariables()
		})

		// Triggers on changes to audio devices, volume, audio settings, etc...
		this.removeAllListeners('VOICE_SETTINGS_UPDATE')
		this.on('VOICE_SETTINGS_UPDATE', (voiceUserUpdate: VoiceSettings) => {
			this.userVoiceSettings = voiceUserUpdate
			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('selfMute', 'selfDeaf', 'voiceStyling')
		})

		// Triggers when a user joins the voice channel
		this.removeAllListeners('VOICE_STATE_CREATE')
		this.on('VOICE_STATE_CREATE', (voiceState: VoiceState) => {
			if (this.voiceChannel === null) return

			this.voiceChannel.voice_states?.push(voiceState)
			this.voiceChannel.voice_states?.sort((a, b) => {
				if (a.nick < b.nick) return -1
				if (b.nick > a.nick) return 1
				return a.user.id < b.user.id ? -1 : 1
			})

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('voiceStyling')
		})

		// Triggers when a user leaves the voice channelTriggers
		this.removeAllListeners('VOICE_STATE_DELETE')
		this.on('VOICE_STATE_DELETE', (voiceState: VoiceState) => {
			if (this.voiceChannel === null) return

			this.voiceChannel!.voice_states = this.voiceChannel?.voice_states?.filter(
				(voiceUser) => voiceUser.user.id !== voiceState.user.id
			)

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('voiceStyling')
		})

		//  when a user on the voice channel changes voice state
		this.removeAllListeners('VOICE_STATE_UPDATE')
		this.on('VOICE_STATE_UPDATE', (voiceState: VoiceState) => {
			if (this.voiceChannel === null) return

			const index = this.voiceChannel.voice_states.findIndex((voiceUser) => voiceUser.user.id === voiceState.user.id)

			if (index !== -1) {
				this.voiceChannel.voice_states[index] = voiceState
			} else {
				this.voiceChannel.voice_states.push(voiceState)
				this.voiceChannel.voice_states.sort((a, b) => {
					if (a.nick < b.nick) return -1
					if (b.nick > a.nick) return 1
					return a.user.id < b.user.id ? -1 : 1
				})
			}

			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('otherMute', 'otherDeaf', 'voiceStyling')
		})

		// Triggers when a user starts transmitting in the current channel
		this.removeAllListeners('SPEAKING_START')
		this.on('SPEAKING_START', (args: VoiceSpeaking) => {
			this.speaking.add(args.user_id)
			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('voiceStyling')
		})

		// Triggers when a user stops transmitting in the current channel
		this.removeAllListeners('SPEAKING_STOP')
		this.on('SPEAKING_STOP', (args: VoiceSpeaking) => {
			this.speaking.delete(args.user_id)
			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('voiceStyling')
		})
	}

	// Obtains a new Access Token if instance has a Refresh Token
	private refreshTokens = async (refreshToken: string): Promise<Tokens | null> => {
		try {
			const response: any = await got
				.post(`${this.baseURL}/oauth2/token`, {
					form: {
						client_id: this.instance.config.clientID,
						client_secret: this.instance.config.clientSecret,
						refresh_token: refreshToken,
						grant_type: 'refresh_token',
					},
				})
				.json()

			return response
		} catch (e: any) {
			this.instance.log('debug', `Failed to refresh tokens: ${e.message}`)
			return null
		}
	}

	// Formats a request for Discord
	private request = (cmd: Commands, args?: any, evt?: any): Promise<any> => {
		return new Promise((resolve, reject) => {
			const nonce = createUUID()
			this.IPC.send({ cmd, args, evt, nonce })
			this._expecting.set(nonce, { resolve, reject })
		})
	}

	// RPC message handler
	private rpcMessage = (message: any) => {
		if (message.cmd === 'DISPATCH' && message.evt === 'READY') {
			if (message.data.user) this.user = message.data.user

			this.emit('connected')
		} else if (this._expecting.has(message.nonce)) {
			const { resolve, reject } = this._expecting.get(message.nonce)

			if (message.evt === 'ERROR') {
				const e: any = new Error(message.data.message)
				e.code = message.data.code
				e.data = message.data

				reject(e)
			} else {
				resolve(message.data)
			}

			this._expecting.delete(message.nonce)
		} else {
			this.emit(message.evt, message.data)
		}
	}

	// Joines or Parts a Voice Channel
	public selectVoiceChannel = (id: string | null, { timeout, force = false }: any = {}) => {
		return this.request('SELECT_VOICE_CHANNEL', { channel_id: id, timeout, force })
	}

	// Focuses Discord client on the specified Text Channel
	public selectTextChannel = (id: string): Promise<any> => {
		return this.request('SELECT_TEXT_CHANNEL', { channel_id: id })
	}

	// Sets other users Voice Settings
	public setUserVoiceSettings = (id: string, settings: VoiceSettingsOther): Promise<any> => {
		return this.request('SET_USER_VOICE_SETTINGS', {
			user_id: id,
			mute: settings.mute,
			volume: settings.volume,
		})
	}

	// Sets self Voice Settings
	public setVoiceSettings = (selfVoiceSettings: Partial<VoiceSettings>): Promise<any> => {
		return this.request('SET_VOICE_SETTINGS', selfVoiceSettings).then((newVoiceSettings: VoiceSettings) => {
			this.userVoiceSettings = newVoiceSettings
			this.instance.variables.updateVariables()
			this.instance.checkFeedbacks('selfMute', 'selfDeaf')
		})
	}

	// Returns alphabetically sorted list of Text Channels
	public sortedTextChannelChoices = (): DropdownChoice[] => {
		const choices: DropdownChoice[] = []

		this.channels
			.filter((channel) => channel.type === 0)
			.forEach((channel) => {
				choices.push({ id: channel.id, label: `${this.guildNames.get(channel.guild_id)} - ${channel.name}` })
			})

		choices.sort((a, b) => a.label.localeCompare(b.label))

		return choices
	}

	// Returns alphabetically sorted list of Voice Channels
	public sortedVoiceChannelChoices = (): DropdownChoice[] => {
		const choices: DropdownChoice[] = []

		this.channels
			.filter((channel) => channel.type === 2)
			.forEach((channel) => {
				choices.push({ id: channel.id, label: `${this.guildNames.get(channel.guild_id)} - ${channel.name}` })
			})

		choices.sort((a, b) => a.label.localeCompare(b.label))

		return choices
	}

	// Returns all users (and self) of current voice channel
	public sortedVoiceUsers = (): VoiceState[] => {
		if (!this.voiceChannel?.voice_states) return []
		const voiceUsers = [...this.voiceChannel.voice_states]

		voiceUsers.sort((a, b) => {
			return a.nick.localeCompare(b.nick) !== 0 ? a.nick.localeCompare(b.nick) : 0
		})

		return voiceUsers
	}

	// Subscribe to Discord Events
	private subscribe = async (event: Events, args?: any): Promise<any> => {
		await this.request('SUBSCRIBE', args, event).catch((err) => {
			this.instance.log('debug', `Discord SUBSCRIBE err: ${err.message}`)
		})

		return {
			unsubscribe: () => this.request('UNSUBSCRIBE', args, event),
		}
	}

	// Gets full list of guilds and channels
	private updateChannelList = async (): Promise<void> => {
		this.guilds = await this.getGuilds()
		this.channels = await this.getChannelsAll()

		this.guilds.forEach((guild) => {
			this.guildNames.set(guild.id, guild.name)
		})

		this.instance.updateInstance()
		return
	}
}

export = RPCClient
