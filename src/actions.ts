import { CompanionActionContext, CompanionActionEvent, SomeCompanionActionInputField } from '@companion-module/base'
import { RichPresence } from './client'
import DiscordInstance from './index'
import { generateWebhookOptions, webhookAction } from './webhook'

export interface DiscordActions {
	selfMute: DiscordAction<SelfMuteCallback>
	selfDeafen: DiscordAction<SelfDeafenCallback>
	selfInputVolume: DiscordAction<SelfInputVolumeCallback>
	selfOutputVolume: DiscordAction<SelfOutputVolumeCallback>
	otherMute: DiscordAction<OtherMuteCallback>
	otherVolume: DiscordAction<OtherVolumeCallback>
	joinVoiceChannel: DiscordAction<JoinVoiceChannelCallback>
	leaveCurrentVoiceChannel: DiscordAction<LeaveCurrentVoiceChannelCallback>
	joinTextChannel: DiscordAction<JoinTextChannelCallback>
	selectUser: DiscordAction<SelectUserCallback>
	richPresence: DiscordAction<RichPresenceCallback>
	clearRichPresence: DiscordAction<ClearRichPresenceCallback>
	sendWebhookMessage: DiscordAction<SendWebhookMessageCallback>

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

export type ActionCallbacks =
	| SelfMuteCallback
	| SelfDeafenCallback
	| SelfInputVolumeCallback
	| SelfOutputVolumeCallback
	| OtherMuteCallback
	| OtherVolumeCallback
	| JoinVoiceChannelCallback
	| LeaveCurrentVoiceChannelCallback
	| JoinTextChannelCallback
	| SelectUserCallback
	| RichPresenceCallback
	| ClearRichPresenceCallback
	| SendWebhookMessageCallback

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
			callback: (action) => {
				if (instance.discord.data.userVoiceSettings === null) return

				if (instance.discord.data.userVoiceSettings.deaf) {
					if (action.options.type !== 'Mute') instance.discord.client.setVoiceSettings({ mute: false, deaf: false })
				} else {
					let mute = action.options.type === 'Mute'
					if (action.options.type === 'Toggle') mute = !instance.discord.data.userVoiceSettings.mute
					if (mute === instance.discord.data.userVoiceSettings.mute) return

					instance.discord.client.setVoiceSettings({ mute })
				}
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
			callback: (action) => {
				let deaf = action.options.type === 'Deafen'
				if (action.options.type === 'Toggle') deaf = !instance.discord.data.userVoiceSettings!.deaf
				if (instance.discord.data.userVoiceSettings === null || deaf === instance.discord.data.userVoiceSettings.deaf) return

				instance.discord.client.setVoiceSettings({ deaf })
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
			callback: (action) => {
				if (action.options.type === 'Set') {
					instance.discord.client.setVoiceSettings({ input: { volume: action.options.volume } } as any)
				} else {
					const currentVolume = instance.discord.data.userVoiceSettings?.input.volume
					if (currentVolume !== undefined) {
						let newVolume = currentVolume + (action.options.type === 'Increase' ? action.options.volume : -action.options.volume)
						if (newVolume < 0) newVolume = 0
						if (newVolume > 100) newVolume = 100

						instance.discord.client.setVoiceSettings({ input: { volume: newVolume } } as any)
					}
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
			callback: (action) => {
				if (action.options.channel === '0') return

				if (action.options.channel !== instance.discord.data.voiceChannel?.id) {
					instance.discord.client.selectVoiceChannel(action.options.channel, { force: action.options.force })
				} else {
					if (action.options.leave) instance.discord.client.selectVoiceChannel(null, { force: action.options.force })
				}
			},
		},

		leaveCurrentVoiceChannel: {
			name: 'Leave Current Channel',
			options: [],
			callback: () => {
				if (instance.discord.data.voiceChannel) instance.discord.client.selectVoiceChannel(null)
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
			callback: (action) => {
				if (action.options.channel === '0') return

				instance.discord.client.selectTextChannel(action.options.channel)
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
			name: 'Activity',
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

				await instance.discord.client.setActivity(activity)
			},
		},

		clearRichPresence: {
			name: 'Activity Clear',
			description: 'Clears the Activity set by this connection',
			options: [],
			callback: async () => {
				instance.log('debug', 'Clearing activity')
				await instance.discord.client.clearActivity()
			},
		},

		sendWebhookMessage: {
			name: 'Send Webhook Message',
			description: 'Sends a message to a Webhook URL set up on a Discord Channel',
			options: generateWebhookOptions(),
			callback: (action, context) => webhookAction(instance, action, context),
		},
	}
}
