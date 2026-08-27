import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type { InstanceTypes } from '../index.js'

export const getVideoDefinitions = (): CompanionPresetDefinitions<InstanceTypes> => {
	const videoDefinitions: CompanionPresetDefinitions<InstanceTypes> = {
		toggleVideo: {
			name: 'Toggle Video',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Toggle Video',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'videoToggleCamera', options: {} }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'videoCamera',
					options: {},
					style: { color: 0xffffff, bgcolor: 0xff0000 },
				},
			],
		},

		toggleScreenShare: {
			name: 'Toggle Screen Share',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Toggle Screen Share',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'videoToggleScreenshare', options: {} }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'videoScreenShare',
					options: {},
					style: { color: 0xffffff, bgcolor: 0xff0000 },
				},
			],
		},
	}

	return videoDefinitions
}

export const getVideoStructure = (): CompanionPresetSection<InstanceTypes>[] => {
	const structure: CompanionPresetSection<InstanceTypes>[] = [
		{
			id: 'presetVideo',
			name: 'Video Presets',
			description: 'Control of sending Video or Screen Sharing in a Voice channel',
			definitions: [
				{
					id: 'voiceStatus',
					type: 'simple',
					name: '',
					description: '',
					presets: ['toggleVideo', 'toggleScreenShare'],
				},
			],
		},
	]

	return structure
}
