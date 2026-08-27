import type { CompanionFeedbackSchema, CompanionFeedbackDefinitions } from '@companion-module/base'
import type DiscordInstance from '../index.js'

export type OtherFeedbackSchema = {
	otherDeaf: CompanionFeedbackSchema<{
		user: string
	}>
	otherMicActive: CompanionFeedbackSchema<{
		user: string
	}>
	otherMute: CompanionFeedbackSchema<{
		user: string
	}>
	selectedUser: CompanionFeedbackSchema<{
		user: string
	}>
}

export const getOtherFeedbacks = (instance: DiscordInstance): CompanionFeedbackDefinitions<OtherFeedbackSchema> => {
	return {
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
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: async (feedback) => {
				const user = feedback.options.user
				if (!user) return false

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(user, 10)) && parseInt(user, 10) === index) return true
					return user === voiceState.user.id || user === `${voiceState.user.username}#${voiceState.user.discriminator}` || user === voiceState.nick
				})

				return voiceUser?.voice_state.deaf || voiceUser?.voice_state.self_deaf || false
			},
		},

		otherMicActive: {
			type: 'boolean',
			name: 'Voice - Other Mic Active',
			description: 'Indicate if a users mic is active such as PTT being pressed, or Voice Activity level being reached',
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
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: async (feedback) => {
				const user = feedback.options.user
				if (!user) return false

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(user, 10)) && parseInt(user, 10) === index) return true
					return user === voiceState.user.id || user === `${voiceState.user.username}#${voiceState.user.discriminator}` || user === voiceState.nick
				})

				if (!voiceUser) return false
				return instance.discord.data.speaking.has(voiceUser.user.id)
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
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: async (feedback) => {
				const user = feedback.options.user
				if (!user) return false

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(user, 10)) && parseInt(user, 10) === index) return true
					return user === voiceState.user.id || user === `${voiceState.user.username}#${voiceState.user.discriminator}` || user === voiceState.nick
				})

				return voiceUser?.mute || voiceUser?.voice_state.mute || voiceUser?.voice_state.self_mute || false
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
				color: 0xffffff,
				bgcolor: 0x006400,
			},
			callback: async (feedback) => {
				const user = feedback.options.user
				if (!user) return false

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(user, 10)) && parseInt(user, 10) === index) return true
					return user === voiceState.user.id || user === `${voiceState.user.username}#${voiceState.user.discriminator}` || user === voiceState.nick
				})

				return voiceUser?.user.id === instance.discord.data.selectedUser || false
			},
		},
	}
}
