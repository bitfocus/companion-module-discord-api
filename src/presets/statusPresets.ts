import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type { InstanceTypes } from '../index.js'

export const getStatusDefinitions = (): CompanionPresetDefinitions<InstanceTypes> => {
	const statusDefinitions: CompanionPresetDefinitions<InstanceTypes> = {
		voice_ping: {
			name: `Voice\nPing`,
			type: 'simple',
			style: {
				text: `Ping\n$(label:voice_connection_ping)`,
				size: '14',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		voice_ping_avg: {
			name: `Voice\nAVG Ping`,
			type: 'simple',
			style: {
				text: `Avg Ping\n$(label:voice_connection_ping_avg)`,
				size: '14',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		voice_ping_min: {
			name: `Voice\nMin Ping`,
			type: 'simple',
			style: {
				text: `Min Ping\n$(label:voice_connection_ping_min)`,
				size: '14',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		voice_ping_max: {
			name: `Voice\nMax Ping`,
			type: 'simple',
			style: {
				text: `Max Ping\n$(label:voice_connection_ping_max)`,
				size: '14',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		voice_ping_connection: {
			name: `Voice\nConnection\nStatus`,
			type: 'simple',
			style: {
				text: `Status\n$(label:voice_connection_status)`,
				size: '14',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
	}

	return statusDefinitions
}

export const getStatusStructure = (): CompanionPresetSection<InstanceTypes>[] => {
	const structure: CompanionPresetSection<InstanceTypes>[] = [
		{
			id: 'presetDiscordStatus',
			name: 'Discord Voice Status',
			description: 'Voice Connection status and ping',
			definitions: [
				{
					id: 'voiceStatus',
					type: 'simple',
					name: 'Ping / Connection Status',
					description: '',
					presets: ['voice_ping', 'voice_ping_avg', 'voice_ping_min', 'voice_ping_max', 'voice_ping_connection'],
				},
			],
		},
	]

	return structure
}
