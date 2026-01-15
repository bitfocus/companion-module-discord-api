import { CompanionActionContext, CompanionActionEvent, SomeCompanionActionInputField } from '@companion-module/base'
import { type UserVoiceSettings } from '@distdev/discord-ipc'
import { RichPresence } from './client'
import DiscordInstance from './index'
import { generateWebhookOptions, webhookAction } from './webhook'

export interface DiscordActions {
	selfMute: DiscordAction<SelfMuteCallback>
	selfDeafen: DiscordAction<SelfDeafenCallback>
	selfInputVolume: DiscordAction<SelfInputVolumeCallback>
	selfOutputVolume: DiscordAction<SelfOutputVolumeCallback>
	selfInputMode: DiscordAction<SelfInputModeCallback>
	otherMute: DiscordAction<OtherMuteCallback>
	otherVolume: DiscordAction<OtherVolumeCallback>
	joinVoiceChannel: DiscordAction<JoinVoiceChannelCallback>
	leaveCurrentVoiceChannel: DiscordAction<LeaveCurrentVoiceChannelCallback>
	joinTextChannel: DiscordAction<JoinTextChannelCallback>
	selectUser: DiscordAction<SelectUserCallback>
	richPresence: DiscordAction<RichPresenceCallback>
	clearRichPresence: DiscordAction<ClearRichPresenceCallback>
	sendWebhookMessage: DiscordAction<SendWebhookMessageCallback>
	ptt: DiscordAction<PTTCallback>
	playSoundboard: DiscordAction<PlaySoundboardCallback>
	videoToggleCamera: DiscordAction<VideoToggleCameraallback>
	videoToggleScreenshare: DiscordAction<VideoToggleScreenshareCallback>

	// Index signature
	[key: string]: DiscordAction<any>
}

interface SelfMuteCallback {
	actionId: 'selfMute'
	options: Readonly<{
		type: 'Toggle' | 'Mute' | 'Unmute'
	}>
}

interface SelfDeafenCallback {
	actionId: 'selfDeafen'
	options: Readonly<{
		type: 'Toggle' | 'Deafen' | 'Undeafen'
	}>
}

interface SelfInputVolumeCallback {
	actionId: 'selfInputVolume'
	options: Readonly<{
		type: 'Set' | 'Increase' | 'Decrease'
		volume: number
	}>
}

interface SelfOutputVolumeCallback {
	actionId: 'selfOutputVolume'
	options: Readonly<{
		type: 'Set' | 'Increase' | 'Decrease'
		volume: number
	}>
}

interface SelfInputModeCallback {
	actionId: 'selfInputMode'
	options: Readonly<{
		mode: 'Toggle' | 'PUSH_TO_TALK' | 'VOICE_ACTIVITY'
	}>
}

interface OtherMuteCallback {
	actionId: 'otherMute'
	options: Readonly<{
		type: 'Toggle' | 'Mute' | 'Unmute'
		user: string
	}>
}

interface OtherVolumeCallback {
	actionId: 'otherVolume'
	options: Readonly<{
		type: 'Set' | 'Increase' | 'Decrease'
		volume: number
		user: string
	}>
}

interface JoinVoiceChannelCallback {
	actionId: 'joinVoiceChannel'
	options: Readonly<{
		channel: string
		force: boolean
		leave: boolean
	}>
}

interface LeaveCurrentVoiceChannelCallback {
	actionId: 'leaveCurrentVoiceChannel'
	options: Record<string, never>
}

interface JoinTextChannelCallback {
	actionId: 'joinTextChannel'
	options: Readonly<{
		channel: string
	}>
}

interface SelectUserCallback {
	actionId: 'selectUser'
	options: Readonly<{
		user: string
	}>
}

interface RichPresenceCallback {
	actionId: 'richPresence'
	options: Readonly<{
		details: string
		state: string
		imgLarge: string
		imgLargeText: string
		imgSmall: string
		imgSmallText: string
		button1Label: string
		button1URL: string
		button2Label: string
		button2URL: string
		startTime: boolean
	}>
}

interface ClearRichPresenceCallback {
	actionId: 'clearRichPresence'
	options: Record<string, never>
}

export interface SendWebhookMessageCallback {
	actionId: 'sendWebhookMessage'
	options: Record<string, string | number | boolean>
}

interface PTTCallback {
	actionId: 'ptt'
	options: Readonly<{
		active: boolean
	}>
}

interface PlaySoundboardCallback {
	actionId: 'playSoundboard'
	options: Readonly<{
		sound: string
	}>
}

interface VideoToggleCameraallback {
	actionId: 'videoToggleCamera'
	options: Record<string, never>
}

interface VideoToggleScreenshareCallback {
	actionId: 'videoToggleScreenshare'
	options: Record<string, never>
}

export type ActionCallbacks =
	| SelfMuteCallback
	| SelfDeafenCallback
	| SelfInputVolumeCallback
	| SelfOutputVolumeCallback
	| SelfInputModeCallback
	| OtherMuteCallback
	| OtherVolumeCallback
	| JoinVoiceChannelCallback
	| LeaveCurrentVoiceChannelCallback
	| JoinTextChannelCallback
	| SelectUserCallback
	| RichPresenceCallback
	| ClearRichPresenceCallback
	| SendWebhookMessageCallback
	| PTTCallback
	| PlaySoundboardCallback
	| VideoToggleCameraallback
	| VideoToggleScreenshareCallback

// Force options to have a default to prevent sending undefined values
export type InputFieldWithDefault = Exclude<SomeCompanionActionInputField, 'default'> & {
	default: string | number | boolean | null
}

// Actions specific to Discord
export interface DiscordAction<T> {
	name: string
	description?: string
	options: InputFieldWithDefault[]
	callback: (action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>, context: CompanionActionContext) => void | Promise<void>
	subscribe?: (action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>) => void
	unsubscribe?: (action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>) => void
}

export function getActions(instance: DiscordInstance): DiscordActions {
	return {
		selfMute: {
			name: 'Self - Mute',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'Toggle',
					choices: [
						{ id: 'Toggle', label: 'Toggle' },
						{ id: 'Mute', label: 'Mute' },
						{ id: 'Unmute', label: 'Unmute' },
					],
				},
			],
			callback: async (action) => {
				if (instance.discord.data.userVoiceSettings === null) return

				if (instance.discord.data.userVoiceSettings.deaf) {
					if (action.options.type !== 'Mute') return instance.discord.client.setVoiceSettings({ mute: false, deaf: false }).then()
				} else {
					let mute = action.options.type === 'Mute'
					if (action.options.type === 'Toggle') mute = !instance.discord.data.userVoiceSettings.mute
					if (mute === instance.discord.data.userVoiceSettings.mute) return

					return instance.discord.client.setVoiceSettings({ mute }).then()
				}
				return
			},
		},

		selfDeafen: {
			name: 'Self - Deafen',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'Toggle',
					choices: [
						{ id: 'Toggle', label: 'Toggle' },
						{ id: 'Deafen', label: 'Deafen' },
						{ id: 'unDeafen', label: 'unDeafen' },
					],
				},
			],
			callback: async (action) => {
				let deaf = action.options.type === 'Deafen'
				if (action.options.type === 'Toggle') deaf = !instance.discord.data.userVoiceSettings!.deaf
				if (instance.discord.data.userVoiceSettings === null || deaf === instance.discord.data.userVoiceSettings.deaf) return

				return instance.discord.client.setVoiceSettings({ deaf }).then()
			},
		},

		selfInputVolume: {
			name: 'Self - Input Volume',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'Set',
					choices: [
						{ id: 'Set', label: 'Set' },
						{ id: 'Increase', label: 'Increase' },
						{ id: 'Decrease', label: 'Decrease' },
					],
				},
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					default: 100,
					min: 0,
					max: 100,
				},
			],
			callback: async (action) => {
				if (action.options.type === 'Set') {
					return instance.discord.client.setVoiceSettings({ input: { volume: action.options.volume } } as any).then()
				} else {
					const currentVolume = instance.discord.data.userVoiceSettings?.input.volume
					if (currentVolume !== undefined) {
						let newVolume = currentVolume + (action.options.type === 'Increase' ? action.options.volume : -action.options.volume)
						if (newVolume < 0) newVolume = 0
						if (newVolume > 100) newVolume = 100

						return instance.discord.client.setVoiceSettings({ input: { volume: newVolume } } as any).then()
					}

					return
				}
			},
		},

		selfOutputVolume: {
			name: 'Self - Output Volume',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'Set',
					choices: [
						{ id: 'Set', label: 'Set' },
						{ id: 'Increase', label: 'Increase' },
						{ id: 'Decrease', label: 'Decrease' },
					],
				},
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					default: 100,
					min: 0,
					max: 200,
				},
			],
			callback: (action) => {
				if (action.options.type === 'Set') {
					instance.discord.client.setVoiceSettings({ output: { volume: action.options.volume } } as any)
				} else {
					const currentVolume = instance.discord.data.userVoiceSettings?.output.volume
					if (currentVolume !== undefined) {
						let newVolume = currentVolume + (action.options.type === 'Increase' ? action.options.volume : -action.options.volume)
						if (newVolume < 0) newVolume = 0
						if (newVolume > 200) newVolume = 200

						instance.discord.client.setVoiceSettings({ output: { volume: newVolume } } as any)
					}
				}
			},
		},

		selfInputMode: {
			name: 'Self - Input Mode',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					default: 'Toggle',
					choices: [
						{ id: 'Toggle', label: 'Toggle' },
						{ id: 'PUSH_TO_TALK', label: 'Push to Talk' },
						{ id: 'VOICE_ACTIVITY', label: 'Voice Activity' },
					],
				},
			],
			callback: async (action) => {
				let voiceMode = action.options.mode
				if (voiceMode === 'Toggle') voiceMode = instance.discord.data.userVoiceSettings!.mode.type === 'PUSH_TO_TALK' ? 'VOICE_ACTIVITY' : 'PUSH_TO_TALK'

				instance.log('debug', `Setting Input Mode: ${voiceMode}`)
				const newVoiceSettings = await instance.discord.client.setVoiceSettings({ mode: { type: voiceMode } } as Partial<UserVoiceSettings>)
				instance.discord.data.userVoiceSettings = newVoiceSettings
				instance.checkFeedbacks('selfInputMode')
			},
		},

		ptt: {
			name: 'Self - Push to Talk',
			options: [
				{
					type: 'checkbox',
					label: 'Active',
					id: 'active',
					default: true,
				},
			],
			callback: async (action) => {
				instance.log('debug', `PTT: ${action.options.active}`)
				await instance.discord.client.setPushToTalk(action.options.active).then()
			},
		},

		otherMute: {
			name: 'Other - Mute',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'Toggle',
					choices: [
						{ id: 'Toggle', label: 'Toggle' },
						{ id: 'Mute', label: 'Mute' },
						{ id: 'Unmute', label: 'Unmute' },
					],
				},
				{
					type: 'textinput',
					label: 'user',
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user === null || user.user.id === instance.discord.client.user.id) return

				let mute = user.mute

				if (action.options.type === 'Toggle') mute = !mute
				if (action.options.type === 'Mute') mute = true
				if (action.options.type === 'Unmute') mute = false

				await instance.discord.client.setUserVoiceSettings(user.user.id, { mute })
				instance.variables.updateVariables()
			},
		},

		otherVolume: {
			name: 'Other - Volume',
			description: 'Note: For some reason Discord treats volumes between 94.4 and 100 as 100, so increase/decrease outside of that range',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'Set',
					choices: [
						{ id: 'Set', label: 'Set' },
						{ id: 'Increase', label: 'Increase' },
						{ id: 'Decrease', label: 'Decrease' },
					],
				},
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					default: 100,
					min: 0,
					max: 100,
				},
				{
					type: 'textinput',
					label: 'user',
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user === null || user.user.id === instance.discord.client.user.id) return

				let volume = action.options.volume

				if (action.options.type !== 'Set') {
					volume = user.volume + (action.options.type === 'Increase' ? volume : -volume)

					if (volume < 0) volume = 0
					if (volume > 200) volume = 200
				}

				await instance.discord.client.setUserVoiceSettings(user.user.id, { volume })
				instance.variables.updateVariables()
			},
		},

		joinVoiceChannel: {
			name: 'Join Channel - Voice',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...(instance.discord.sortedVoiceChannelChoices() || [])],
				},
				{
					type: 'checkbox',
					label: 'Force',
					tooltip: 'When enabled allows for changing voice channels while already connected to one',
					id: 'force',
					default: true,
				},
				{
					type: 'checkbox',
					label: 'Leave if already joined',
					tooltip: 'When enabled allows for changing voice channels while already connected to one',
					id: 'leave',
					default: true,
				},
			],
			callback: async (action) => {
				if (action.options.channel === '0') return

				if (action.options.channel !== instance.discord.data.voiceChannel?.id) {
					return instance.discord.client.selectVoiceChannel(action.options.channel, { force: action.options.force }).then()
				} else {
					if (action.options.leave) return instance.discord.client.selectVoiceChannel(null, { force: action.options.force }).then()
				}

				return
			},
		},

		leaveCurrentVoiceChannel: {
			name: 'Leave Current Channel',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) return instance.discord.client.selectVoiceChannel(null).then()

				return
			},
		},

		joinTextChannel: {
			name: 'Join Channel - Text',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...(instance.discord.sortedTextChannelChoices() || [])],
				},
			],
			callback: async (action) => {
				if (action.options.channel === '0') return

				return instance.discord.client.selectTextChannel(action.options.channel).then()
			},
		},

		selectUser: {
			name: 'Select User',
			options: [
				{
					type: 'textinput',
					label: 'User',
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user) instance.discord.data.selectedUser = instance.discord.data.selectedUser === user.user.id ? '' : user.user.id

				instance.variables.updateVariables()
				instance.checkFeedbacks('selectedUser', 'otherMute')
			},
		},

		richPresence: {
			name: 'Activity - Set Activity/Rich Presence',
			description: 'Sets the Activity to show playing your App Name',
			options: [
				{
					type: 'textinput',
					label: 'Details',
					tooltip: 'Line 1 of text',
					id: 'details',
					default: '',
				},
				{
					type: 'textinput',
					label: 'State',
					tooltip: 'Line 2 of text',
					id: 'state',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Large Image',
					tooltip: 'Must match an art asset uploaded to your Discord Developer console',
					id: 'imgLarge',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Large Image Text',
					id: 'imgLargeText',
					default: '',
					isVisible: (options) => {
						return options.imgLarge !== ''
					},
				},
				{
					type: 'textinput',
					label: 'Small Image',
					tooltip: 'Must match an art asset uploaded to your Discord Developer console',
					id: 'imgSmall',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Small Image Text',
					id: 'imgSmallText',
					default: '',
					isVisible: (options) => {
						return options.imgSmall !== ''
					},
				},
				{
					type: 'textinput',
					label: 'Button 1 Text',
					id: 'button1Label',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Button 1 URL',
					id: 'button1URL',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Button 2 Text',
					id: 'button2Label',
					default: '',
					isVisible: (options) => {
						return options.button1Label !== '' && options.button1URL !== ''
					},
				},
				{
					type: 'textinput',
					label: 'Button 2 URL',
					id: 'button2URL',
					default: '',
					isVisible: (options) => {
						return options.button1Label !== '' && options.button1URL !== ''
					},
				},
				{
					type: 'checkbox',
					label: 'Show Start Time',
					id: 'startTime',
					default: true,
				},
			],
			callback: async (action) => {
				const all = [
					instance.parseVariablesInString(action.options.state),
					instance.parseVariablesInString(action.options.details),
					instance.parseVariablesInString(action.options.imgLarge),
					instance.parseVariablesInString(action.options.imgLargeText),
					instance.parseVariablesInString(action.options.imgSmall),
					instance.parseVariablesInString(action.options.imgSmallText),
					instance.parseVariablesInString(action.options.button1Label),
					instance.parseVariablesInString(action.options.button1URL),
					instance.parseVariablesInString(action.options.button2Label),
					instance.parseVariablesInString(action.options.button2URL),
				]

				const [state, details, imgLarge, imgLargeText, imgSmall, imgSmallText, button1Label, button1URL, button2Label, button2URL] = await Promise.all(all)

				const activity: RichPresence = {
					state,
					details,
				}

				if (!state || !details) {
					instance.log('warn', 'Discord Rich Presence must have a State and Details')
					return
				}

				if (imgLarge) {
					activity.largeImageKey = imgLarge
					activity.largeImageText = imgLargeText
				}

				if (imgSmall) {
					activity.smallImageKey = imgSmall
					activity.smallImageText = imgSmallText
				}

				if (button1Label && button1URL) {
					activity.buttons = [{ label: button1Label, url: button1URL }]

					if (button2Label && button2URL) {
						activity.buttons.push({ label: button2Label, url: button2URL })
					}
				}

				if (action.options.startTime) activity.startTimestamp = new Date()

				instance.log('debug', `Setting activity: ${JSON.stringify(activity)}`)

				return instance.discord.client.setActivity(activity).then()
			},
		},

		clearRichPresence: {
			name: 'Activity - Clear Activity/Rich Presence',
			description: 'Clears the Activity set by this connection',
			options: [],
			callback: async () => {
				instance.log('debug', 'Clearing activity')
				return instance.discord.client.clearActivity().then()
			},
		},

		sendWebhookMessage: {
			name: 'Webhooks - Send Webhook Message',
			description: 'Sends a message to a Webhook URL set up on a Discord Channel',
			options: generateWebhookOptions(),
			callback: async (action, context) => webhookAction(instance, action, context),
		},

		playSoundboard: {
			name: 'Play Soundboard Sound',
			description: 'Playing cross server soundboard sounds requires Discord Nitro',
			options: [
				{
					type: 'dropdown',
					label: 'Sound',
					id: 'sound',
					default: '0',
					choices: [{ id: '0', label: 'Select Sound' }, ...(instance.discord.sortedSoundboardChioces() || [])],
				},
			],
			callback: async (action) => {
				if (action.options.sound === '0') return

				if (instance.discord.data.voiceChannel) {
					const [guild_id, sound_id] = action.options.sound.split(':')
					instance.log('debug', `Playing Soundboard - Guild ID ${guild_id} - Sound ID ${sound_id}`)

					return instance.discord.client
						.playSoundboardSound(guild_id, sound_id)
						.catch((err) => {
							if (err?.data) {
								instance.log('warn', `Error playing Soundboard: ${JSON.stringify(err.data)}`)
							} else {
								instance.log('warn', 'Error playing Soundboard')
								instance.log('debug', err)
							}
						})
						.then()
				}

				return
			},
		},

		videoToggleCamera: {
			name: 'Video - Toggle Camera',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) {
					instance.log('debug', `Toggling Camera`)
					return instance.discord.client.toggleVideo().then()
				}

				return
			},
		},

		videoToggleScreenshare: {
			name: 'Video - Toggle Screen Share',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) {
					instance.log('debug', `Toggling Screen sharing`)
					return instance.discord.client.toggleScreenshare().then()
				}

				return
			},
		},
	}
}
