import type { CompanionFeedbackSchema, CompanionFeedbackDefinitions } from '@companion-module/base'
import type DiscordInstance from '../index.js'

export type VideoFeedbacksSchema = {
	videoCamera: CompanionFeedbackSchema<{}>
	videoScreenShare: CompanionFeedbackSchema<{}>
}

export const getVideoFeedbacks = (instance: DiscordInstance): CompanionFeedbackDefinitions<VideoFeedbacksSchema> => {
	return {
		videoCamera: {
			type: 'boolean',
			name: 'Video - Camera Active',
			description: 'Indicates if video sharing is active',
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: () => {
				return instance.discord.data.videoActive
			},
		},

		videoScreenShare: {
			type: 'boolean',
			name: 'Video - Screen Share Active',
			description: 'Indicates if screen sharing is active',
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: () => {
				return instance.discord.data.screenShareActive
			},
		},
	}
}
