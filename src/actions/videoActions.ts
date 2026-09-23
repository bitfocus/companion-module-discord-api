import { type CompanionActionDefinitions, type CompanionActionSchema, createModuleLogger } from '@companion-module/base'
import type DiscordInstance from '../index.js'

export type VideoActionsSchema = {
	videoToggleCamera: CompanionActionSchema<Record<string, never>, void>
	videoToggleScreenshare: CompanionActionSchema<Record<string, never>, void>
}

const log = createModuleLogger('Actions')

export const getVideoActions = (instance: DiscordInstance): CompanionActionDefinitions<VideoActionsSchema> => {
	return {
		videoToggleCamera: {
			name: 'Video - Toggle Camera',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) {
					log.debug(`Toggling Camera`)
					await instance.discord.client.toggleVideo().catch((err: any) => {
						log.warn(`Any toggling camera: ${err}`)
					})
				}
			},
		},

		videoToggleScreenshare: {
			name: 'Video - Toggle Screen Share',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) {
					log.debug(`Toggling Screen sharing`)
					await instance.discord.client.toggleScreenshare().catch((err: any) => {
						log.warn(`Error toggling screen sharing: ${err}`)
					})
				}
			},
		},
	}
}
