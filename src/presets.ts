import { ActionCallbacks } from './actions'
import { FeedbackCallbacks } from './feedback'
import { CompanionButtonPresetDefinition, CompanionPresetDefinitions } from '@companion-module/base'

type PresetCategory = 'Voice Control' | 'Voice Status & User Selection' | 'Video Control' | 'Discord Status'

interface DiscordPresetAdditions {
	category: PresetCategory
	steps: {
		down: ActionCallbacks[]
		up: ActionCallbacks[]
	}[]
	feedbacks: FeedbackCallbacks[]
}

export type DiscordPreset = Exclude<CompanionButtonPresetDefinition, 'category' | 'steps' | 'feedbacks'> & DiscordPresetAdditions

export function getPresets(): CompanionPresetDefinitions {
	const presets: DiscordPreset[] = [
		{
			category: 'Voice Control',
			name: 'Self Mute',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nMute',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'selfMute', options: { type: 'Toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selfMute',
					options: {},
					style: { color: 0xffffff, bgcolor: 0xff0000 },
				},
			],
		},
		{
			category: 'Voice Control',
			name: 'Self Deafen',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nDeafen',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'selfDeafen', options: { type: 'Toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selfDeaf',
					options: {},
					style: { color: 0xffffff, bgcolor: 0xff0000 },
				},
			],
		},
		{
			category: 'Voice Control',
			name: 'Leave Current Voice Channel',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Leave\\nVoice\\nChannel',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'leaveCurrentVoiceChannel', options: {} }],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			name: 'Self Increase Input Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nIn Vol\\n+10',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'selfInputVolume', options: { type: 'Increase', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			name: 'Self Decrease Input Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nIn Vol\\n-10',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'selfInputVolume', options: { type: 'Decrease', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			name: 'Self Increase Input Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nOut Vol\\n+10',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'selfOutputVolume', options: { type: 'Increase', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			name: 'Self Decrease Input Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nOut Vol\\n-10',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'selfOutputVolume', options: { type: 'Decrease', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			name: 'Selected User Mute',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Toggle\\nUser\\nMute',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'otherMute', options: { type: 'Toggle', user: `$(label}:voice_user_selected_id)` } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'otherMute',
					options: { user: '' },
					style: { color: 0xffffff, bgcolor: 0xff0000 },
				},
			],
		},
		{
			category: 'Voice Control',
			name: 'Increase Selected User Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Vol\\n+10',
				size: '18',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherVolume',
							options: { type: 'Increase', volume: 10, user: `$(label}:voice_user_selected_id)` },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			name: 'Decrease Selected User Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Vol\\n-10',
				size: '18',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherVolume',
							options: { type: 'Decrease', volume: 10, user: `$(label}:voice_user_selected_id)` },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Control',
			name: 'Voice Input Mode',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Voice Input Toggle',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'selfInputMode', options: { mode: 'Toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selfInputMode',
					options: {
						state: 'PUSH_TO_TALK',
					},
					style: { color: 0x000000, bgcolor: 0xff0000 },
				},
			],
		},
		{
			category: 'Voice Control',
			name: 'Push to Talk',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'PTT',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'ptt', options: { active: true } }],
					up: [{ actionId: 'ptt', options: { active: false } }],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selfMicActive',
					options: {},
					style: { color: 0x000000, bgcolor: 0x00ff00 },
				},
			],
		},
		{
			category: 'Voice Control',
			name: 'Play Soundboard Sound',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Soundboard',
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'playSoundboard', options: { sound: '0' } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		{
			category: 'Voice Status & User Selection',
			name: 'Mic Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `Mic\\n$(label:voice_self_input_volume)`,
				size: '18',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Status & User Selection',
			name: 'Headset Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `Headset\\n$(label:voice_self_output_volume)`,
				size: '18',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Status & User Selection',
			name: 'Selected User',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `User\\n$(label:voice_user_selected_nick)`,
				size: '18',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Voice Status & User Selection',
			name: 'Selected User Volume',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `Vol\\n$(label:voice_user_selected_volume)`,
				size: '18',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Video Control',
			name: 'Toggle Video',
			type: 'button',
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
		{
			category: 'Video Control',
			name: 'Toggle Screen Share',
			type: 'button',
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
		{
			category: 'Discord Status',
			name: 'Voice Ping',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `Ping\\n$(label:voice_connection_ping)`,
				size: '18',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Discord Status',
			name: 'Voice Avg, Min, Max, Ping',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `Avg: $(label:voice_connection_ping_avg)\\nMin: $(label:voice_connection_ping_min)\\nMax: $(label:voice_connection_ping_max)`,
				size: '18',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
		{
			category: 'Discord Status',
			name: 'Voice Connection',
			type: 'button',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `$(label:voice_connection_status)`,
				size: '18',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
	]

	for (let i = 0; i < 10; i++) {
		presets.push({
			category: 'Voice Status & User Selection',
			name: `User ${i}`,
			type: 'button',
			style: {
				alignment: 'center:top',
				bgcolor: 0x000000,
				color: 0xffffff,
				pngalignment: 'center:bottom',
				text: `$(label:voice_user_${i}_nick)`,
				size: '18',
			},
			steps: [
				{
					down: [{ actionId: 'selectUser', options: { user: `${i}` } }],
					up: [],
				},
			],
			feedbacks: [
				{ feedbackId: 'voiceStyling', options: { user: `${i}` } },
				{
					feedbackId: 'selectedUser',
					options: { user: `${i}` },
					style: { color: 0xffffff, bgcolor: 0x006400 },
				},
			],
		})
	}

	return presets as unknown as CompanionPresetDefinitions
}
