import { CompanionActionEventInfo, CompanionActionEvent, SomeCompanionInputField } from '../../../instance_skel_types'
import DiscordInstance from './index'

export interface DiscordActions {
	selfMute: DiscordAction<SelfMuteCallback>
	selfDeafen: DiscordAction<SelfDeafenCallback>
	selfInputVolume: DiscordAction<SelfInputVolumeCallback>
	selfOutputVolume: DiscordAction<SelfOutputVolumeCallback>
	otherMute: DiscordAction<OtherMuteCallback>
	otherVolume: DiscordAction<OtherVolumeCallback>
	joinVoiceChannel: DiscordAction<JoinVoiceChannelCallback>
	joinTextChannel: DiscordAction<JoinTextChannelCallback>
	selectUser: DiscordAction<SelectUserCallback>

	// Index signature
	[key: string]: DiscordAction<any>
}

interface SelfMuteCallback {
	action: 'selfMute'
	options: Readonly<{
		type: 'Toggle' | 'Mute' | 'Unmute'
	}>
}

interface SelfDeafenCallback {
	action: 'selfDeafen'
	options: Readonly<{
		type: 'Toggle' | 'Deafen' | 'Undeafen'
	}>
}

interface SelfInputVolumeCallback {
	action: 'selfInputVolume'
	options: Readonly<{
		type: 'Set' | 'Increase' | 'Decrease'
		volume: number
	}>
}

interface SelfOutputVolumeCallback {
	action: 'selfOutputVolume'
	options: Readonly<{
		type: 'Set' | 'Increase' | 'Decrease'
		volume: number
	}>
}

interface OtherMuteCallback {
	action: 'otherMute'
	options: Readonly<{
		type: 'Toggle' | 'Mute' | 'Unmute'
		user: string
	}>
}

interface OtherVolumeCallback {
	action: 'otherVolume'
	options: Readonly<{
		type: 'Set' | 'Increase' | 'Decrease'
		volume: number
		user: string
	}>
}

interface JoinVoiceChannelCallback {
	action: 'joinVoiceChannel'
	options: Readonly<{
		channel: string
		force: boolean
		leave: boolean
	}>
}

interface JoinTextChannelCallback {
	action: 'joinTextChannel'
	options: Readonly<{
		channel: string
	}>
}

interface SelectUserCallback {
	action: 'selectUser'
	options: Readonly<{
		user: string
	}>
}

export type ActionCallbacks =
	| SelfMuteCallback
	| SelfDeafenCallback
	| SelfInputVolumeCallback
	| SelfOutputVolumeCallback
	| OtherMuteCallback
	| OtherVolumeCallback
	| JoinVoiceChannelCallback
	| JoinTextChannelCallback
	| SelectUserCallback

// Force options to have a default to prevent sending undefined values
type InputFieldWithDefault = Exclude<SomeCompanionInputField, 'default'> & { default: string | number | boolean | null }

// Actions specific to Discord
export interface DiscordAction<T> {
	label: string
	description?: string
	options: InputFieldWithDefault[]
	callback: (
		action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>,
		info: Readonly<CompanionActionEventInfo | null>
	) => void
	subscribe?: (action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>) => void
	unsubscribe?: (action: Readonly<Omit<CompanionActionEvent, 'options' | 'id'> & T>) => void
}

export function getActions(instance: DiscordInstance): DiscordActions {
	return {
		selfMute: {
			label: 'Self - Mute',
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
				if (instance.client.userVoiceSettings === null) return

				if (instance.client.userVoiceSettings.deaf) {
					if (action.options.type !== 'Mute') instance.client.setVoiceSettings({ mute: false, deaf: false })
				} else {
					let mute = action.options.type === 'Mute'
					if (action.options.type === 'Toggle') mute = !instance.client.userVoiceSettings!.mute
					if (mute === instance.client.userVoiceSettings!.mute) return

					instance.client.setVoiceSettings({ mute })
				}
			},
		},

		selfDeafen: {
			label: 'Self - Deafen',
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
				if (action.options.type === 'Toggle') deaf = !instance.client.userVoiceSettings!.deaf
				if (instance.client.userVoiceSettings === null || deaf === instance.client.userVoiceSettings!.deaf) return

				instance.client.setVoiceSettings({ deaf })
			},
		},

		selfInputVolume: {
			label: 'Self - Input Volume',
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
					instance.client.setVoiceSettings({ input: { volume: action.options.volume } } as any)
				} else {
					const currentVolume = instance.client.userVoiceSettings?.input.volume
					if (currentVolume !== undefined) {
						let newVolume =
							currentVolume + (action.options.type === 'Increase' ? action.options.volume : -action.options.volume)
						if (newVolume < 0) newVolume = 0
						if (newVolume > 100) newVolume = 100

						instance.client.setVoiceSettings({ input: { volume: newVolume } } as any)
					}
				}
			},
		},

		selfOutputVolume: {
			label: 'Self - Output Volume',
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
					instance.client.setVoiceSettings({ output: { volume: action.options.volume } } as any)
				} else {
					const currentVolume = instance.client.userVoiceSettings?.output.volume
					if (currentVolume !== undefined) {
						let newVolume =
							currentVolume + (action.options.type === 'Increase' ? action.options.volume : -action.options.volume)
						if (newVolume < 0) newVolume = 0
						if (newVolume > 100) newVolume = 100

						instance.client.setVoiceSettings({ output: { volume: newVolume } } as any)
					}
				}
			},
		},

		otherMute: {
			label: 'Other - Mute',
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
					tooltip: 'User ID, name#discriminator, nick',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = instance.client.getUser(action.options.user)
				if (user === null) return

				let mute = user.mute

				if (action.options.type === 'Toggle') mute = !mute
				if (action.options.type === 'Mute') mute = true
				if (action.options.type === 'Unmute') mute = false

				await instance.client.setUserVoiceSettings(user.user.id, { mute })
				instance.variables.updateVariables()
			},
		},

		otherVolume: {
			label: 'Other - Volume',
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
					tooltip: 'User ID, name#discriminator, nick',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = instance.client.getUser(action.options.user)
				if (user === null) return

				let volume = action.options.volume

				if (action.options.type !== 'Set') {
					volume = user.volume + (action.options.type === 'Increase' ? volume : -volume)

					if (volume < 0) volume = 0
					if (volume > 200) volume = 200
				}

				await instance.client.setUserVoiceSettings(user.user.id, { volume })
				instance.variables.updateVariables()
			},
		},

		joinVoiceChannel: {
			label: 'Join Channel - Voice',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...instance.client.sortedVoiceChannelChoices()],
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

				if (action.options.channel !== instance.client.voiceChannel?.id) {
					instance.client.selectVoiceChannel(action.options.channel, { force: action.options.force })
				} else {
					if (action.options.leave) instance.client.selectVoiceChannel(null, { force: action.options.force })
				}
			},
		},

		joinTextChannel: {
			label: 'Join Channel - Text',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...instance.client.sortedTextChannelChoices()],
				},
			],
			callback: (action) => {
				if (action.options.channel === '0') return

				instance.client.selectTextChannel(action.options.channel)
			},
		},

		selectUser: {
			label: 'Select User',
			options: [
				{
					type: 'textinput',
					label: 'User',
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const selected = instance.client.sortedVoiceUsers().find((voiceState, index) => {
					const idCheck = voiceState.user.id === action.options.user
					const usernameCheck =
						`${voiceState.user.username.toLowerCase()}#${voiceState.user.discriminator}` ===
						action.options.user.toLowerCase()
					const nickCheck = voiceState.nick.toLowerCase() === action.options.user.toLowerCase()
					const indexCheck = !isNaN(parseInt(action.options.user, 10)) && parseInt(action.options.user, 10) === index
					return idCheck || usernameCheck || nickCheck || indexCheck
				})

				if (selected)
					instance.client.selectedUser = instance.client.selectedUser === selected.user.id ? '' : selected.user.id

				instance.variables.updateVariables()
				instance.checkFeedbacks('selectedUser', 'otherMute')
			},
		},
	}
}
