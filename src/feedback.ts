import DiscordInstance from './index'
//import { voicePNG64 } from './png64'
import { graphics } from 'companion-module-utils'
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
export type FeedbackCallbacks = SelfMuteCallback | SelfDeafCallback | OtherMuteCallback | OtherDeafCallback | VoiceChannelCallback | VoiceStylingCallback | SelectedUserCallback

// Force options to have a default to prevent sending undefined values
type InputFieldWithDefault = Exclude<SomeCompanionFeedbackInputField, 'default'> & {
	default: string | number | boolean | null
}

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
	callback: (
		feedback: Readonly<Omit<CompanionFeedbackAdvancedEvent, 'options' | 'type'> & T>,
		context: any,
	) => CompanionAdvancedFeedbackResult | Promise<CompanionAdvancedFeedbackResult>
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
				return instance.discord.data.userVoiceSettings?.mute || instance.discord.data.userVoiceSettings?.deaf || false
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
				return instance.discord.data.userVoiceSettings?.deaf || false
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
				const userOption = await context.parseVariablesInString(feedback.options.user)
				if (!userOption) userOption === feedback.options.user

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true
					return userOption === voiceState.user.id || userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` || userOption === voiceState.nick
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
				const userOption = await context.parseVariablesInString(feedback.options.user)
				if (!userOption) userOption === feedback.options.user

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true
					return userOption === voiceState.user.id || userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` || userOption === voiceState.nick
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
					choices: [{ id: '0', label: 'Select Channel' }, ...(instance.discord.sortedVoiceChannelChoices() || [])],
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				return feedback.options.channel === instance.discord.data.voiceChannel?.id
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
				if (!feedback.image) return {}
				const userOption = await context.parseVariablesInString(feedback.options.user)
				if (!userOption) userOption === feedback.options.user

				const self = userOption.toLowerCase() === 'self'
				let mute: 'mic1' | 'mic2' | 'mic3' | 'mic4' | 'mic5' = 'mic1'
				let deaf: 'headset1' | 'headset2' | 'headset3' | 'headset4' = 'headset1'

				// 0 = unmuted, 1 = muted other, 2 = server mute, 3 = self mute/suppressed

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true

					if (self) return voiceState.user.id === instance.discord.client.user.id
					return userOption === voiceState.user.id || userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` || userOption === voiceState.nick
				})

				if (voiceUser) {
					if (voiceUser.voice_state.self_mute || voiceUser.voice_state.suppress) mute = 'mic2'
					if (voiceUser.mute) mute = 'mic3'
					if (instance.discord.data.speaking.has(voiceUser.user.id)) mute = 'mic5'
					if (voiceUser.voice_state.mute) mute = 'mic4'
					if (voiceUser.voice_state.self_deaf) deaf = 'headset2'
					if (voiceUser.voice_state.deaf) deaf = 'headset4'

					const micIcon = graphics.icon({
						width: feedback.image.width,
						height: feedback.image.height,
						type: mute,
						offsetX: 13,
						offsetY: feedback.image.height === 72 ? 38 : 24,
					})

					const headsetIcon = graphics.icon({
						width: feedback.image.width,
						height: feedback.image.height,
						type: deaf,
						offsetX: 35,
						offsetY: feedback.image.height === 72 ? 38 : 24,
					})

					return {
						imageBuffer: graphics.stackImage([micIcon, headsetIcon]),
					}
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
				const userOption = await context.parseVariablesInString(feedback.options.user)
				if (!userOption) userOption === feedback.options.user

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true
					return userOption === voiceState.user.id || userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` || userOption === voiceState.nick
				})

				return voiceUser?.user.id === instance.discord.data.selectedUser || false
			},
		},
	}
}
