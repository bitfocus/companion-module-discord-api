import type { CompanionFeedbackSchema, CompanionFeedbackDefinitions } from '@companion-module/base'
import type DiscordInstance from '../index.js'

export type SelfFeedbacksSchema = {
	selfMute: CompanionFeedbackSchema<Record<string, never>>
	selfDeaf: CompanionFeedbackSchema<Record<string, never>>
	selfInputMode: CompanionFeedbackSchema<{
		state: 'PUSH_TO_TALK' | 'VOICE_ACTIVITY'
	}>
	selfMicActive: CompanionFeedbackSchema<Record<string, never>>
}

export const getSelfFeedbacks = (instance: DiscordInstance): CompanionFeedbackDefinitions<SelfFeedbacksSchema> => {
	return {
		selfMute: {
			type: 'boolean',
			name: 'Voice - Self Mute',
			description: `Indicates if you're muted`,
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: () => {
				return instance.discord.data.userVoiceSettings?.mute || instance.discord.data.userVoiceSettings?.deaf || false
			},
		},

		selfDeaf: {
			type: 'boolean',
			name: 'Voice - Self Deaf',
			description: `Indicates if you're deafened`,
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: () => {
				return instance.discord.data.userVoiceSettings?.deaf || false
			},
		},

		selfInputMode: {
			type: 'boolean',
			name: 'Voice - Self Input Mode',
			description: `Indicates if you're on PTT or Voice Activity`,
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 'PUSH_TO_TALK',
					choices: [
						{ id: 'PUSH_TO_TALK', label: 'Push To Talk' },
						{ id: 'VOICE_ACTIVITY', label: 'Voice Activity' },
					],
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: (feedback) => {
				return instance.discord.data.userVoiceSettings?.mode.type === feedback.options.state
			},
		},

		selfMicActive: {
			type: 'boolean',
			name: 'Voice - Self Mic Active',
			description: 'Indicate if your mic is active such as PTT being pressed, or Voice Activity level being reached',
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: () => {
				return instance.discord.data.speaking.has(instance.discord.client.user?.id)
			},
		},
	}
}
