import type { CompanionFeedbackSchema, CompanionFeedbackDefinitions } from '@companion-module/base'
import { graphics } from 'companion-module-utils'
import type DiscordInstance from '../index.js'
import { options } from '../utils.js'

export type VoiceFeedbacksSchema = {
	voiceChannel: CompanionFeedbackSchema<{
		channel: string
	}>
	voiceStyling: CompanionFeedbackSchema<{
		user: string
	}>
}

export const getVoiceFeedbacks = (instance: DiscordInstance): CompanionFeedbackDefinitions<VoiceFeedbacksSchema> => {
	return {
		voiceChannel: {
			type: 'boolean',
			name: 'Voice - Channel',
			description: `Indicates if you're in the specified Voice Channel`,
			options: [options(instance).channelVoice],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
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
			affectedProperties: ['imageBuffer'],
			callback: async (feedback) => {
				if (!feedback.image) return {}
				const user = feedback.options.user
				if (!user) return {}

				const self = user.toLowerCase() === 'self'
				let mute: 'mic1' | 'mic2' | 'mic3' | 'mic4' | 'mic5' = 'mic1'
				let deaf: 'headset1' | 'headset2' | 'headset3' | 'headset4' = 'headset1'

				// 0 = unmuted, 1 = muted other, 2 = server mute, 3 = self mute/suppressed

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(user, 10)) && parseInt(user, 10) === index) return true

					if (self) return voiceState.user.id === instance.discord.client.user.id
					return user === voiceState.user.id || user === `${voiceState.user.username}#${voiceState.user.discriminator}` || user === voiceState.nick
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
						imageBuffer: Buffer.from(graphics.stackImage([micIcon, headsetIcon])).toString('base64'),
					}
				}

				return {}
			},
		},
	}
}
