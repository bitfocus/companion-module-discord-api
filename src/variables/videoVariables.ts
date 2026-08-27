import type { CompanionVariableDefinitions } from '@companion-module/base'
import type DiscordInstance from '../index.js'

export type VideoVariablesSchema = {
	video_camera_active: boolean
	video_screen_share_active: boolean
}

export const videoDefinitions = (_instance: DiscordInstance): CompanionVariableDefinitions<VideoVariablesSchema> => {
	const definitions: CompanionVariableDefinitions<VideoVariablesSchema> = {
		video_camera_active: { name: 'Video Camera Active' },
		video_screen_share_active: { name: 'Video Screen Share Active' },
	}

	return definitions
}

export const videoValues = async (instance: DiscordInstance): Promise<VideoVariablesSchema> => {
	const variables: VideoVariablesSchema = {
		video_camera_active: instance.discord.data.videoActive,
		video_screen_share_active: instance.discord.data.screenShareActive,
	}

	return variables
}
