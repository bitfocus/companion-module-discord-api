import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { type Manifest } from './index.js'

export function getPresets(): [CompanionPresetSection<Manifest>[], CompanionPresetDefinitions<Manifest>] {
	const structure: CompanionPresetSection<Manifest>[] = [
		{
			id: 'status',
			name: 'Discord Status',
			description: 'Ping and state of the voice connection',
			definitions: ['ping_details', 'ping', 'voice_connection_status'],
		},
		{
			id: 'users',
			name: 'User Selection',
			description: 'Select a user, and saw status of this one',
			definitions: [],
		},
		{
			id: 'voice_status',
			name: 'Voice Status',
			description: 'configure selected user mic and headphone (or yours)',
			definitions: [],
		},
		{
			id: 'voice',
			name: 'Voice Control',
			description: 'Volumes, muting, soundboard, etc...',
			definitions: [],
		},
		{
			id: 'video',
			name: 'Video Control',
			description: 'Camera and screen share',
			definitions: [],
		},
	]
	const presets: CompanionPresetDefinitions<Manifest> = {
		ping_details: {
			type: 'simple',
			name: 'Details of ping',
			keywords: ['ping', 'latency', 'average', 'minimum', 'maximum'],
			style: {
				textExpression: true,
				text: "`Min: ${$(label:voice_connection)['ping']['min']}\nAvg: ${$(label:voice_connection)['ping']['average']}\nMax: ${$(label:voice_connection)['ping']['max']}`",
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
				alignment: 'left:center',
			},
			steps: [],
			feedbacks: [],
		},
		ping: {
			type: 'simple',
			name: 'The current ping',
			keywords: ['ping', 'latency', 'current'],
			style: {
				textExpression: true,
				text: "`Ping:\n${$(label:voice_connection)['ping']['current']}`",
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [],
			feedbacks: [],
		},
		voice_connection_status: {
			type: 'simple',
			name: 'The status of voice connection',
			keywords: ['connection', 'status'],
			style: {
				textExpression: true,
				text: "$(label:voice_connection)['status']",
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [],
			feedbacks: [],
		},
	}

	return [structure, presets]
}
