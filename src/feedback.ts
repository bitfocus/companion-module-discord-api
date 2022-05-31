import DiscordInstance from './index'
import { voicePNG64 } from './png64'
import {
	CompanionFeedbackEvent,
	SomeCompanionInputField,
	CompanionBankRequiredProps,
	CompanionBankAdditionalStyleProps,
	CompanionFeedbackEventInfo,
	CompanionBankPNG,
} from '../../../instance_skel_types'

export interface DiscordFeedbacks {
	selfMute: DiscordFeedback<SelfMuteCallback>
	selfDeaf: DiscordFeedback<SelfDeafCallback>
	otherMute: DiscordFeedback<OtherMuteCallback>
	voiceChannel: DiscordFeedback<VoiceChannelCallback>
	voiceStyling: DiscordFeedback<VoiceStylingCallback>
	selectedUser: DiscordFeedback<SelectedUserCallback>

	// Index signature
	[key: string]: DiscordFeedback<any>
}

interface SelfMuteCallback {
	type: 'selfMute'
	options: Record<string, never>
	style: Readonly<Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps>>
}

interface SelfDeafCallback {
	type: 'selfDeaf'
	options: Record<string, never>
	style: Readonly<Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps>>
}

interface OtherMuteCallback {
	type: 'otherMute'
	options: Readonly<{
		user: string
	}>
	style: Readonly<Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps>>
}

interface OtherDeafCallback {
	type: 'otherDeaf'
	options: Readonly<{
		user: string
	}>
	style: Readonly<Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps>>
}

interface VoiceChannelCallback {
	type: 'voiceChannel'
	options: Readonly<{
		channel: string
	}>
	style: Readonly<Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps>>
}

interface VoiceStylingCallback {
	type: 'voiceStyling'
	options: Readonly<{
		user: string
	}>
}

interface SelectedUserCallback {
	type: 'selectedUser'
	options: Readonly<{
		user: string
	}>
	style: Readonly<Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps>>
}

// Callback type for Presets
export type FeedbackCallbacks =
	| SelfMuteCallback
	| SelfDeafCallback
	| OtherMuteCallback
	| OtherDeafCallback
	| VoiceChannelCallback
	| VoiceStylingCallback
	| SelectedUserCallback

// Force options to have a default to prevent sending undefined values
type InputFieldWithDefault = Exclude<SomeCompanionInputField, 'default'> & { default: string | number | boolean | null }

// Discord Boolean and Advanced feedback types
interface DiscordFeedbackBoolean<T> {
	type: 'boolean'
	label: string
	description: string
	style: Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps>
	options: InputFieldWithDefault[]
	callback?: (
		feedback: Readonly<Omit<CompanionFeedbackEvent, 'options' | 'type'> & T>,
		bank: Readonly<CompanionBankPNG | null>,
		info: Readonly<CompanionFeedbackEventInfo | null>
	) => boolean
	subscribe?: (feedback: Readonly<Omit<CompanionFeedbackEvent, 'options' | 'type'> & T>) => boolean
	unsubscribe?: (feedback: Readonly<Omit<CompanionFeedbackEvent, 'options' | 'type'> & T>) => boolean
}

interface DiscordFeedbackAdvanced<T> {
	type: 'advanced'
	label: string
	description: string
	options: InputFieldWithDefault[]
	callback?: (
		feedback: Readonly<Omit<CompanionFeedbackEvent, 'options' | 'type'> & T>,
		bank: Readonly<CompanionBankPNG | null>,
		info: Readonly<CompanionFeedbackEventInfo | null>
	) => Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps> | void
	subscribe?: (
		feedback: Readonly<Omit<CompanionFeedbackEvent, 'options' | 'type'> & T>
	) => Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps> | void
	unsubscribe?: (
		feedback: Readonly<Omit<CompanionFeedbackEvent, 'options' | 'type'> & T>
	) => Partial<CompanionBankRequiredProps & CompanionBankAdditionalStyleProps> | void
}

export type DiscordFeedback<T> = DiscordFeedbackBoolean<T> | DiscordFeedbackAdvanced<T>

export function getFeedbacks(instance: DiscordInstance): DiscordFeedbacks {
	return {
		selfMute: {
			type: 'boolean',
			label: 'Voice - Self Mute',
			description: `Indicates if you've muted yourself`,
			options: [],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 0, 0),
			},
			callback: () => {
				return instance.client.userVoiceSettings?.mute || instance.client.userVoiceSettings?.deaf || false
			},
		},

		selfDeaf: {
			type: 'boolean',
			label: 'Voice - Self Deaf',
			description: `Indicates if you've deafened yourself`,
			options: [],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 0, 0),
			},
			callback: () => {
				return instance.client.userVoiceSettings?.deaf || false
			},
		},

		otherMute: {
			type: 'boolean',
			label: 'Voice - Other Mute',
			description: 'Indicates if another user is muted',
			options: [
				{
					type: 'textinput',
					label: 'user',
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
				},
			],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 0, 0),
			},
			callback: (feedback) => {
				let userOption = ''

				instance.parseVariables(feedback.options.user, (value) => {
					userOption = userOption = value || feedback.options.user
				})

				const voiceUser = instance.client.sortedVoiceUsers().find((voiceState, index) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true
					return (
						userOption === voiceState.user.id ||
						userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						userOption === voiceState.nick
					)
				})

				return voiceUser?.mute || voiceUser?.voice_state.mute || voiceUser?.voice_state.self_mute || false
			},
		},

		otherDeaf: {
			type: 'boolean',
			label: 'Voice - Other Deaf',
			description: 'Indicates if another user is deafened',
			options: [
				{
					type: 'textinput',
					label: 'user',
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
				},
			],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(255, 0, 0),
			},
			callback: (feedback) => {
				let userOption = ''

				instance.parseVariables(feedback.options.user, (value) => {
					userOption = userOption = value || feedback.options.user
				})

				const voiceUser = instance.client.sortedVoiceUsers().find((voiceState, index) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true
					return (
						userOption === voiceState.user.id ||
						userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						userOption === voiceState.nick
					)
				})

				return voiceUser?.voice_state.deaf || voiceUser?.voice_state.self_deaf || false
			},
		},

		voiceChannel: {
			type: 'boolean',
			label: 'Voice - Channel',
			description: `Indicates if you're in the specified Voice Channel`,
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...instance.client.sortedVoiceChannelChoices()],
				},
			],
			style: {
				color: instance.rgb(0, 0, 0),
				bgcolor: instance.rgb(0, 255, 0),
			},
			callback: (feedback) => {
				return feedback.options.channel === instance.client.voiceChannel?.id
			},
		},

		voiceStyling: {
			type: 'advanced',
			label: 'Voice - Styled Voice Status',
			description: 'PNG styled mute/deaf/speaking status',
			options: [
				{
					type: 'textinput',
					label: 'user',
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: 'Self',
				},
			],
			callback: (feedback) => {
				let userOption = ''

				instance.parseVariables(feedback.options.user, (value) => {
					userOption = userOption = value || feedback.options.user
				})

				const self = userOption.toLowerCase() === 'self'
				let mute = '0'
				let deaf = '0'

				// 0 = unmuted, 1 = muted other, 2 = server mute, 3 = self mute/suppressed

				const voiceUser = instance.client.sortedVoiceUsers().find((voiceState, index) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true

					if (self) voiceState.user.id === instance.client.user.id
					return (
						userOption === voiceState.user.id ||
						userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						userOption === voiceState.nick
					)
				})

				if (voiceUser) {
					if (voiceUser.voice_state.self_mute || voiceUser.voice_state.suppress) mute = '3'
					if (voiceUser.mute) mute = '1'
					if (instance.client.speaking.has(voiceUser.user.id)) mute = 's'
					if (voiceUser.voice_state.mute) mute = '2'
					if (voiceUser.voice_state.self_deaf) deaf = '3'
					if (voiceUser.voice_state.deaf) deaf = '2'

					const status = `m${mute}d${deaf}`
					if (voicePNG64[status]) return { pngalignment: 'center:bottom', png64: voicePNG64[status] }
				}

				return
			},
		},

		selectedUser: {
			type: 'boolean',
			label: 'Selected User',
			description: 'Indicates currently selected user',
			options: [
				{
					type: 'textinput',
					label: 'user',
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
				},
			],
			style: {
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(0, 100, 0),
			},
			callback: (feedback) => {
				let userOption = ''

				instance.parseVariables(feedback.options.user, (value) => {
					userOption = userOption = value || feedback.options.user
				})

				const voiceUser = instance.client.sortedVoiceUsers().find((voiceState, index) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true
					return (
						userOption === voiceState.user.id ||
						userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						userOption === voiceState.nick
					)
				})

				return voiceUser?.user.id === instance.client.selectedUser || false
			},
		},
	}
}
