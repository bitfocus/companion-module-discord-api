import DiscordInstance from './index'
import { voicePNG64 } from './png64'
import {
  combineRgb,
  CompanionAdvancedFeedbackResult,
  CompanionFeedbackButtonStyleResult,
  CompanionFeedbackAdvancedEvent,
  CompanionFeedbackBooleanEvent,
  //CompanionFeedbackContext,
  SomeCompanionFeedbackInputField,
} from '@companion-module/base'

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
	feedbackId: 'selfMute'
	options: Record<string, never>
	defaultStyle?: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
	style: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
}

interface SelfDeafCallback {
	feedbackId: 'selfDeaf'
	options: Record<string, never>
	defaultStyle?: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
	style: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
}

interface OtherMuteCallback {
	feedbackId: 'otherMute'
	options: Readonly<{
		user: string
	}>
	defaultStyle?: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
	style: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
}

interface OtherDeafCallback {
	feedbackId: 'otherDeaf'
	options: Readonly<{
		user: string
	}>
	defaultStyle?: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
	style: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
}

interface VoiceChannelCallback {
	feedbackId: 'voiceChannel'
	options: Readonly<{
		channel: string
	}>
	defaultStyle?: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
	style: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
}

interface VoiceStylingCallback {
	feedbackId: 'voiceStyling'
	options: Readonly<{
		user: string
	}>
}

interface SelectedUserCallback {
	feedbackId: 'selectedUser'
	options: Readonly<{
		user: string
	}>
	defaultStyle?: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
	style: Readonly<Partial<CompanionFeedbackButtonStyleResult>>
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
type InputFieldWithDefault = Exclude<SomeCompanionFeedbackInputField, 'default'> & { default: string | number | boolean | null }

// Discord Boolean and Advanced feedback types
interface DiscordFeedbackBoolean<T> {
  type: 'boolean'
  name: string
  description: string
  defaultStyle: Partial<CompanionFeedbackButtonStyleResult>
  options: InputFieldWithDefault[]
  callback: (feedback: Readonly<Omit<CompanionFeedbackBooleanEvent, 'options' | 'type'> & T>, context: any) => boolean | Promise<boolean>
  subscribe?: (feedback: Readonly<Omit<CompanionFeedbackBooleanEvent, 'options' | 'type'> & T>) => boolean
  unsubscribe?: (feedback: Readonly<Omit<CompanionFeedbackBooleanEvent, 'options' | 'type'> & T>) => boolean
}

interface DiscordFeedbackAdvanced<T> {
  type: 'advanced'
  name: string
  description: string
  options: InputFieldWithDefault[]
  callback: (feedback: Readonly<Omit<CompanionFeedbackAdvancedEvent, 'options' | 'type'> & T>, context: any) => CompanionAdvancedFeedbackResult | Promise<CompanionAdvancedFeedbackResult>
  subscribe?: (feedback: Readonly<Omit<CompanionFeedbackAdvancedEvent, 'options' | 'type'> & T>) => CompanionAdvancedFeedbackResult
  unsubscribe?: (feedback: Readonly<Omit<CompanionFeedbackAdvancedEvent, 'options' | 'type'> & T>) => CompanionAdvancedFeedbackResult
}

export type DiscordFeedback<T> = DiscordFeedbackBoolean<T> | DiscordFeedbackAdvanced<T>

export function getFeedbacks(instance: DiscordInstance): DiscordFeedbacks {
	return {
		selfMute: {
			type: 'boolean',
			name: 'Voice - Self Mute',
			description: `Indicates if you've muted yourself`,
			options: [],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: () => {
				return instance.clientData.userVoiceSettings?.mute || instance.clientData.userVoiceSettings?.deaf || false
			},
		},

		selfDeaf: {
			type: 'boolean',
			name: 'Voice - Self Deaf',
			description: `Indicates if you've deafened yourself`,
			options: [],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: () => {
				return instance.clientData.userVoiceSettings?.deaf || false
			},
		},

		otherMute: {
			type: 'boolean',
			name: 'Voice - Other Mute',
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
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: async (feedback, context) => {
				let userOption = await context.parseVariablesInString(feedback.options.user)
				if (!userOption) userOption === feedback.options.user

				const voiceUser = instance.clientData.sortedVoiceUsers().find((voiceState: any, index: number) => {
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
			name: 'Voice - Other Deaf',
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
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: async (feedback, context) => {
				let userOption = await context.parseVariablesInString(feedback.options.user)
				if (!userOption) userOption === feedback.options.user

				const voiceUser = instance.clientData.sortedVoiceUsers().find((voiceState: any, index: number) => {
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
			name: 'Voice - Channel',
			description: `Indicates if you're in the specified Voice Channel`,
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...instance.clientData.sortedVoiceChannelChoices()],
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				return feedback.options.channel === instance.clientData.voiceChannel?.id
			},
		},

		voiceStyling: {
			type: 'advanced',
			name: 'Voice - Styled Voice Status',
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
			callback: async (feedback, context) => {
				let userOption = await context.parseVariablesInString(feedback.options.user)
				if (!userOption) userOption === feedback.options.user

				const self = userOption.toLowerCase() === 'self'
				let mute = '0'
				let deaf = '0'

				// 0 = unmuted, 1 = muted other, 2 = server mute, 3 = self mute/suppressed

				const voiceUser = await instance.clientData.sortedVoiceUsers().find((voiceState: any, index: number) => {
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
					if (instance.clientData.speaking.has(voiceUser.user.id)) mute = 's'
					if (voiceUser.voice_state.mute) mute = '2'
					if (voiceUser.voice_state.self_deaf) deaf = '3'
					if (voiceUser.voice_state.deaf) deaf = '2'

					const status = `m${mute}d${deaf}`
					if (voicePNG64[status]) return { pngalignment: 'center:bottom', png64: voicePNG64[status] }
				}

				return {}
			},
		},

		selectedUser: {
			type: 'boolean',
			name: 'Selected User',
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
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 100, 0),
			},
			callback: async (feedback, context) => {
				let userOption = await context.parseVariablesInString(feedback.options.user)
				if (!userOption) userOption === feedback.options.user

				const voiceUser = instance.clientData.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true
					return (
						userOption === voiceState.user.id ||
						userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						userOption === voiceState.nick
					)
				})

				return voiceUser?.user.id === instance.clientData.selectedUser || false
			},
		},
	}
}
