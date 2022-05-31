import DiscordInstance from './index'
import { ActionCallbacks } from './actions'
import { FeedbackCallbacks } from './feedback'
import { CompanionAlignment } from '../../../instance_skel_types'

type PresetCategory = 'Voice Control' | 'Voice Status & User Selection' | 'Discord Status'

export interface DiscordPreset {
	category: PresetCategory
	label: string
	bank: {
		alignment?: CompanionAlignment
		bgcolor: number
		color: number
		pngalignment?: CompanionAlignment
		size: 'auto' | '7' | '14' | '18' | '24' | '30' | '44'
		style: 'text'
		text: string
	}
	actions: ActionCallbacks[]
	release_actions?: ActionCallbacks[]
	feedbacks: FeedbackCallbacks[]
}

export function getPresets(instance: DiscordInstance): DiscordPreset[] {
	const presets: DiscordPreset[] = [
		{
			category: 'Voice Control',
			label: 'Self Mute',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Self\\nMute',
				size: '18',
			},
			actions: [{ action: 'selfMute', options: { type: 'Toggle' } }],
			feedbacks: [
				{
					type: 'selfMute',
					options: {},
					style: { color: instance.rgb(255, 255, 255), bgcolor: instance.rgb(255, 0, 0) },
				},
			],
		},
		{
			category: 'Voice Control',
			label: 'Self Deafen',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Self\\nDeafen',
				size: '18',
			},
			actions: [{ action: 'selfDeafen', options: { type: 'Toggle' } }],
			feedbacks: [
				{
					type: 'selfDeaf',
					options: {},
					style: { color: instance.rgb(255, 255, 255), bgcolor: instance.rgb(255, 0, 0) },
				},
			],
		},
		{
			category: 'Voice Control',
			label: 'Self Increase Input Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Self\\nIn Vol\\n+10',
				size: '18',
			},
			actions: [{ action: 'selfInputVolume', options: { type: 'Increase', volume: 10 } }],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			label: 'Self Decrease Input Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Self\\nIn Vol\\n-10',
				size: '18',
			},
			actions: [{ action: 'selfInputVolume', options: { type: 'Decrease', volume: 10 } }],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			label: 'Self Increase Input Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Self\\nOut Vol\\n+10',
				size: '18',
			},
			actions: [{ action: 'selfOutputVolume', options: { type: 'Increase', volume: 10 } }],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			label: 'Self Decrease Input Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Self\\nOut Vol\\n-10',
				size: '18',
			},
			actions: [{ action: 'selfOutputVolume', options: { type: 'Decrease', volume: 10 } }],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			label: 'Selected User Mute',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Toggle\\nUser\\nMute',
				size: '18',
			},
			actions: [
				{ action: 'otherMute', options: { type: 'Toggle', user: `$(${instance.label}}:voice_user_selected_id)` } },
			],
			feedbacks: [
				{
					type: 'otherMute',
					options: { user: '' },
					style: { color: instance.rgb(255, 255, 255), bgcolor: instance.rgb(255, 0, 0) },
				},
			],
		},
		{
			category: 'Voice Control',
			label: 'Increase Selected User Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Vol\\n+10',
				size: '18',
			},
			actions: [
				{
					action: 'otherVolume',
					options: { type: 'Increase', volume: 10, user: `$(${instance.label}}:voice_user_selected_id)` },
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			label: 'Decrease Selected User Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: 'Vol\\n-10',
				size: '18',
			},
			actions: [
				{
					action: 'otherVolume',
					options: { type: 'Decrease', volume: 10, user: `$(${instance.label}}:voice_user_selected_id)` },
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Status & User Selection',
			label: 'Mic Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: `Mic\\n$(${instance.label}:voice_self_input_volume)`,
				size: '18',
			},
			actions: [],
			feedbacks: [],
		},
		{
			category: 'Voice Status & User Selection',
			label: 'Headset Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: `Headset\\n$(${instance.label}:voice_self_output_volume)`,
				size: '18',
			},
			actions: [],
			feedbacks: [],
		},
		{
			category: 'Voice Status & User Selection',
			label: 'Selected User',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: `User\\n$(${instance.label}:voice_user_selected_nick)`,
				size: '18',
			},
			actions: [],
			feedbacks: [],
		},
		{
			category: 'Voice Status & User Selection',
			label: 'Selected User Volume',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: `Vol\\n$(${instance.label}:voice_user_selected_volume)`,
				size: '18',
			},
			actions: [],
			feedbacks: [],
		},
		{
			category: 'Discord Status',
			label: 'Voice Ping',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: `Ping\\n$(${instance.label}:voice_connection_ping)`,
				size: '18',
			},
			actions: [],
			feedbacks: [],
		},
		{
			category: 'Discord Status',
			label: 'Voice Avg, Min, Max, Ping',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: `Avg: $(${instance.label}:voice_connection_ping_avg)\\nMin: $(${instance.label}:voice_connection_ping_min)\\nMax: $(${instance.label}:voice_connection_ping_max)`,
				size: '18',
			},
			actions: [],
			feedbacks: [],
		},
		{
			category: 'Discord Status',
			label: 'Voice Connection',
			bank: {
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				style: 'text',
				text: `$(${instance.label}:voice_connection_status)`,
				size: '18',
			},
			actions: [],
			feedbacks: [],
		},
	]

	for (let i = 0; i < 10; i++) {
		presets.push({
			category: 'Voice Status & User Selection',
			label: `User ${i}`,
			bank: {
				alignment: 'center:top',
				bgcolor: instance.rgb(0, 0, 0),
				color: instance.rgb(255, 255, 255),
				pngalignment: 'center:bottom',
				style: 'text',
				text: `$(${instance.label}:voice_user_${i}_nick)`,
				size: '18',
			},
			actions: [{ action: 'selectUser', options: { user: `${i}` } }],
			feedbacks: [
				{ type: 'voiceStyling', options: { user: `${i}` } },
				{
					type: 'selectedUser',
					options: { user: `${i}` },
					style: { color: instance.rgb(255, 255, 255), bgcolor: instance.rgb(0, 100, 0) },
				},
			],
		})
	}

	return presets
}
