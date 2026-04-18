import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { type Manifest } from './index.js'

export function getPresets(): [CompanionPresetSection<Manifest>[], CompanionPresetDefinitions<Manifest>] {
	const structure: CompanionPresetSection<Manifest>[] = [
		{
			id: 'status',
			name: 'Discord Status',
			description: 'Ping and state of the voice connection',
			definitions: [],
		},
		{
			id: 'video',
			name: 'Video Control',
			description: 'Camera and screen share',
			definitions: [],
		},
		{
			id: 'voice',
			name: 'Voice Control',
			description: 'Volumes, muting, soundboard, etc...',
			definitions: [],
		},
		{
			id: 'voice_status',
			name: 'Voice Status',
			description: 'configure selected user mic and headphone, or yours',
			definitions: [],
		},
		{
			id: 'users',
			name: 'User Selection',
			description: 'Select a user, and saw status of this one',
			definitions: [],
		},
	]
	const presets: CompanionPresetDefinitions<Manifest> = {
		self_mute: {
			name: 'Self Mute',
			type: 'simple',
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
		self_deafen: {
			name: 'Self Deafen',
			type: 'simple',
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
		leave_current_voice_channel: {
			name: 'Leave Current Voice Channel',
			type: 'simple',
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
		self_increase_input_volume: {
			name: 'Self Increase Input Volume',
			type: 'simple',
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
		self_decrease_input_volume: {
			name: 'Self Decrease Input Volume',
			type: 'simple',
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
		self_increase_output_volume: {
			name: 'Self Increase Output Volume',
			type: 'simple',
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
		self_decrease_output_volume: {
			name: 'Self Decrease Output Volume',
			type: 'simple',
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
		selected_user_mute: {
			name: 'Selected User Mute',
			type: 'simple',
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
		increase_selected_user_volume: {
			name: 'Increase Selected User Volume',
			type: 'simple',
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
		decrease_selected_user_volume: {
			name: 'Decrease Selected User Volume',
			type: 'simple',
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
		voice_input_mode: {
			name: 'Voice Input Mode',
			type: 'simple',
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
		push_to_talk: {
			name: 'Push to Talk',
			type: 'simple',
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
		soundboard: {
			name: 'Play Soundboard Sound',
			type: 'simple',
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
		mic_volume: {
			name: 'Mic Volume',
			type: 'simple',
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
		headset_volume: {
			name: 'Headset Volume',
			type: 'simple',
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
		selected_user: {
			name: 'Selected User',
			type: 'simple',
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
		selected_user_volume: {
			name: 'Selected User Volume',
			type: 'simple',
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
		toggle_video: {
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
		toggle_screen_share: {
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
		voice_ping: {
			name: 'Voice Ping',
			type: 'simple',
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
		voice_pings: {
			name: 'Voice Avg, Min, Max, Ping',
			type: 'simple',
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
		voice_connection: {
			name: 'Voice Connection',
			type: 'simple',
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
	}

	for (let i = 0; i < 10; i++) {
		presets[`user_${i}`] = {
			name: `User ${i}`,
			type: 'simple',
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
		}
	}

	return [structure, presets]
}
