import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { type Manifest } from './index.js'

const numberOfUserPresets = 9

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
			definitions: new Array(numberOfUserPresets)
				.fill(0)
				.map((_, i) => [`avatar${i}`, `select${i}`])
				.flat()
				.sort((a, b) => a.localeCompare(b)),
		},
		{
			id: 'voice_status',
			name: 'Voice Status & User Control',
			description: 'configure selected user mic and headphone (or yours) + guild and channel infos',
			definitions: [
				'guild_details',
				'channel_details',

				'self_volume_input_down',
				'self_volume_input',
				'self_volume_input_up',
				'self_mute',

				'self_volume_output_down',
				'self_volume_output',
				'self_volume_output_up',
				'self_deaf',

				'selected_volume_down',
				'selected_volume',
				'selected_volume_up',
				'selected_mute',

				'other_volume_down',
				'other_volume',
				'other_volume_up',
				'other_mute',
			],
		},
		{
			id: 'voice_control',
			name: 'Voice Control',
			description: 'push to talk, soundboard, etc... (red push to talk is not compatible with your discord parameters, to change: parameters -> voice & video -> push to talk)',
			definitions: ['ptt', 'ptt_mic', 'soundboard', 'leave'],
		},
		{
			id: 'video',
			name: 'Video Control',
			description: 'Camera and screen share',
			definitions: ['camera_toggle', 'screen_share_toggle'],
		},
	]
	const presets: CompanionPresetDefinitions<Manifest> = {
		//region status
		ping_details: {
			type: 'simple',
			name: 'Details of ping',
			keywords: ['ping', 'latency', 'average', 'minimum', 'maximum'],
			style: {
				textExpression: true,
				text: "`\nMin: ${$(label:voice_connection)['ping']['min']}\nAvg: ${$(label:voice_connection)['ping']['average']}\nMax: ${$(label:voice_connection)['ping']['max']}\n`",
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
				text: "`\nPing:\n${$(label:voice_connection)['ping']['current']}\n`",
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
				text: `$(label:voice_connection)['status']`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [],
			feedbacks: [],
		},
		//endregion

		//region voice_status
		guild_details: {
			type: 'simple',
			name: 'The icon and name of current voice connected guild',
			keywords: ['guild', 'server', 'icon'],
			style: {
				textExpression: true,
				text: `$(label:guild)['name'] ?? ''`,
				alignment: 'center:bottom',
				size: 12,
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				textExpression: false,
				text: 'guild',
			},
			steps: [],
			feedbacks: [
				{
					feedbackId: 'showImageContent',
					options: { content: 'guild', selected: 'self' },
				},
			],
		},
		channel_details: {
			type: 'simple',
			name: 'The current voice connected guild and channel',
			keywords: ['channel', 'guild', 'server'],
			style: {
				textExpression: true,
				text: "`\n${$(label:guild)['name'] ?? ''}\n---\n${$(label:channel)['name'] ?? ''}\n`",
				size: '14',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				textExpression: false,
				text: 'guild\\n---\\nchannel',
			},
			steps: [],
			feedbacks: [],
		},

		self_volume_input_down: {
			type: 'simple',
			name: 'Decrease your input volume',
			keywords: ['volume', 'self', 'input', 'decrease', 'mic'],
			style: {
				text: '<',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				text: 'Input decrease volume',
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfInputVolume',
							options: { type: 'decrease', volume: 10 },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		self_volume_input: {
			type: 'simple',
			name: 'Show your input volume',
			keywords: ['volume', 'self', 'input', 'info', 'mic'],
			style: {
				textExpression: true,
				text: "$(label:voice_self)['input_volume']",
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfMute',
							options: { type: 'toggle' },
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'selfInputVolume',
							options: { type: 'decrease', volume: 2 },
						},
					],
					rotate_right: [
						{
							actionId: 'selfInputVolume',
							options: { type: 'increase', volume: 2 },
						},
					],
				},
			],
			feedbacks: [],
		},
		self_volume_input_up: {
			type: 'simple',
			name: 'Increase your input volume',
			keywords: ['volume', 'self', 'input', 'increase', 'mic'],
			style: {
				text: '>',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				text: 'Input increase volume',
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfInputVolume',
							options: { type: 'increase', volume: 10 },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		self_mute: {
			type: 'simple',
			name: 'Self mute',
			keywords: ['self', 'input', 'mute', 'mic'],
			style: {
				text: '',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfMute',
							options: { type: 'toggle' },
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'selfInputVolume',
							options: { type: 'decrease', volume: 2 },
						},
					],
					rotate_right: [
						{
							actionId: 'selfInputVolume',
							options: { type: 'increase', volume: 2 },
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'showImageContent',
					options: { content: 'mic', selected: 'self' },
				},
			],
		},

		self_volume_output_down: {
			type: 'simple',
			name: 'Decrease your output volume',
			keywords: ['volume', 'self', 'output', 'decrease', 'headphone'],
			style: {
				text: '<',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				text: 'Output decrease volume',
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfOutputVolume',
							options: { type: 'decrease', volume: 10 },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		self_volume_output: {
			type: 'simple',
			name: 'Show your output volume',
			keywords: ['volume', 'self', 'output', 'info', 'headphone'],
			style: {
				textExpression: true,
				text: "$(label:voice_self)['output_volume']",
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfDeafen',
							options: { type: 'toggle' },
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'selfOutputVolume',
							options: { type: 'decrease', volume: 2 },
						},
					],
					rotate_right: [
						{
							actionId: 'selfOutputVolume',
							options: { type: 'increase', volume: 2 },
						},
					],
				},
			],
			feedbacks: [],
		},
		self_volume_output_up: {
			type: 'simple',
			name: 'Increase your output volume',
			keywords: ['volume', 'self', 'output', 'increase', 'headphone'],
			style: {
				text: '>',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				text: 'Output increase volume',
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfOutputVolume',
							options: { type: 'increase', volume: 10 },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		self_deaf: {
			type: 'simple',
			name: 'Self deafen',
			keywords: ['volume', 'self', 'output', 'deafen', 'headphone'],
			style: {
				text: '',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfDeafen',
							options: { type: 'toggle' },
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'selfOutputVolume',
							options: { type: 'decrease', volume: 2 },
						},
					],
					rotate_right: [
						{
							actionId: 'selfOutputVolume',
							options: { type: 'increase', volume: 2 },
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'showImageContent',
					options: { content: 'headphone', selected: 'self' },
				},
			],
		},

		selected_volume_down: {
			type: 'simple',
			name: 'Decrease selected user volume',
			keywords: ['volume', 'selected', 'user', 'input', 'decrease', 'mic'],
			style: {
				text: '<',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				text: 'Decrease selected user volume',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherVolume',
							options: { type: 'decrease', volume: 10, user: '$(label:user_selected)' },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		selected_volume: {
			type: 'simple',
			name: 'Show selected user volume',
			keywords: ['volume', 'selected', 'user', 'input', 'info', 'mic'],
			style: {
				textExpression: true,
				text: "$(label:voice_user_selected)['volume'] ?? ''",
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				textExpression: false,
				text: '100',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherMute',
							options: { type: 'toggle', user: '$(label:user_selected)' },
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'otherVolume',
							options: { type: 'decrease', volume: 2, user: '$(label:user_selected)' },
						},
					],
					rotate_right: [
						{
							actionId: 'otherVolume',
							options: { type: 'increase', volume: 2, user: '$(label:user_selected)' },
						},
					],
				},
			],
			feedbacks: [],
		},
		selected_volume_up: {
			type: 'simple',
			name: 'Increase selected user volume',
			keywords: ['volume', 'selected', 'user', 'input', 'increase', 'mic'],
			style: {
				text: '>',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				text: 'Increase selected user volume',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherVolume',
							options: { type: 'increase', volume: 10, user: '$(label:user_selected)' },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		selected_mute: {
			type: 'simple',
			name: 'Selected user mute',
			keywords: ['selected', 'user', 'input', 'mute', 'mic'],
			style: {
				text: '',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherMute',
							options: { type: 'toggle', user: '$(label:user_selected)' },
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'otherVolume',
							options: { type: 'decrease', volume: 2, user: '$(label:user_selected)' },
						},
					],
					rotate_right: [
						{
							actionId: 'otherVolume',
							options: { type: 'increase', volume: 2, user: '$(label:user_selected)' },
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'showImageContent',
					options: { content: 'mic', selected: 'selected' },
				},
			],
		},

		other_volume_down: {
			type: 'simple',
			name: 'Decrease selected user volume',
			keywords: ['volume', 'selected', 'user', 'input', 'decrease', 'mic'],
			style: {
				text: '<',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				text: 'Decrease selected user volume',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherVolume',
							options: { type: 'decrease', volume: 10, user: '$(local:user)' },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'user',
					startupValue: 0,
					headline: 'User ID, username, display name, or index',
				},
			],
		},
		other_volume: {
			type: 'simple',
			name: 'Show selected user volume',
			keywords: ['volume', 'selected', 'user', 'input', 'info', 'mic'],
			style: {
				textExpression: true,
				text: "$(label:voice_users_by_index)[$(local:user)]['volume'] ?? ''",
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				textExpression: false,
				text: '100',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherMute',
							options: { type: 'toggle', user: '$(local:user)' },
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'otherVolume',
							options: { type: 'decrease', volume: 2, user: '$(local:user)' },
						},
					],
					rotate_right: [
						{
							actionId: 'otherVolume',
							options: { type: 'increase', volume: 2, user: '$(local:user)' },
						},
					],
				},
			],
			feedbacks: [],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'user',
					startupValue: 0,
					headline: 'User ID, username, display name, or index',
				},
			],
		},
		other_volume_up: {
			type: 'simple',
			name: 'Increase selected user volume',
			keywords: ['volume', 'selected', 'user', 'input', 'increase', 'mic'],
			style: {
				text: '>',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				text: 'Increase selected user volume',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherVolume',
							options: { type: 'increase', volume: 10, user: '$(local:user)' },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'user',
					startupValue: 0,
					headline: 'User ID, username, display name, or index',
				},
			],
		},
		other_mute: {
			type: 'simple',
			name: 'Selected user mute',
			keywords: ['selected', 'user', 'input', 'mute', 'mic'],
			style: {
				text: '',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherMute',
							options: { type: 'toggle', user: '$(local:user)' },
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'otherVolume',
							options: { type: 'decrease', volume: 2, user: '$(local:user)' },
						},
					],
					rotate_right: [
						{
							actionId: 'otherVolume',
							options: { type: 'increase', volume: 2, user: '$(local:user)' },
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'showImageContent',
					options: { content: 'mic', selected: 'custom', user: '$(local:user)' },
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'user',
					startupValue: 0,
					headline: 'User ID, username, display name, or index',
				},
			],
		},
		//endregion

		//region voice_control
		ptt: {
			type: 'simple',
			name: 'Push to Talk',
			keywords: ['push', 'talk', 'mute'],
			style: {
				text: 'Push to Talk',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'ptt',
							options: { active: true },
						},
					],
					up: [
						{
							actionId: 'ptt',
							options: { active: false },
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selfInputMode',
					options: { state: 'VOICE_ACTIVITY' },
					style: {
						color: 0xffffff,
						bgcolor: 0xff0000,
					},
				},
			],
		},
		ptt_mic: {
			type: 'simple',
			name: 'Push to Talk (non-native version: mute and unmute manually)',
			keywords: ['push', 'talk', 'mute'],
			style: {
				text: 'Push to Talk',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'selfMute',
							options: { type: 'unmute' },
						},
					],
					up: [
						{
							actionId: 'selfMute',
							options: { type: 'mute' },
						},
					],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selfInputMode',
					options: { state: 'PUSH_TO_TALK' },
					style: {
						color: 0xffffff,
						bgcolor: 0xff0000,
					},
				},
			],
		},
		soundboard: {
			type: 'simple',
			name: 'Play soundboard',
			keywords: ['soundboard', 'play', 'effect'],
			style: {
				text: 'Play soundboard',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'playSoundboard',
							options: { sound: '0:1' },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		leave: {
			type: 'simple',
			name: 'Leave current channel',
			keywords: ['leave', 'quit', 'channel', 'stop'],
			style: {
				text: 'Leave current channel',
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'leaveCurrentVoiceChannel',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
		//endregion

		//region video
		camera_toggle: {
			type: 'simple',
			name: 'Toggle the camera',
			keywords: ['camera', 'face', 'head', 'toggle'],
			style: {
				text: 'Camera toggle',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'videoToggleCamera',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'videoCamera',
					options: {},
					style: {
						bgcolor: 0xff0000,
					},
				},
			],
		},
		screen_share_toggle: {
			type: 'simple',
			name: 'Toggle the Screen share',
			keywords: ['screenshare', 'screen', 'share', 'toggle'],
			style: {
				text: 'Screen share toggle',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			steps: [
				{
					down: [
						{
							actionId: 'videoToggleScreenShare',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'videoScreenShare',
					options: {},
					style: {
						bgcolor: 0xff0000,
					},
				},
			],
		},
		//endregion
	}

	//region user
	for (let i = 0; i < numberOfUserPresets; i++) {
		presets[`avatar${i}`] = {
			type: 'simple',
			name: `Avatar of user n°${i}`,
			keywords: ['user', `user${i}`, `${i}`, 'avatar', 'image'],
			style: {
				textExpression: true,
				text: "$(label:voice_users_by_index)[$(local:user)]['nick']",
				alignment: 'center:bottom',
				size: '14',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				textExpression: false,
				text: `user n°${i}`,
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherMute',
							options: { type: 'toggle', user: '$(local:user)' },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'showImageContent',
					options: { content: 'avatar', selected: 'custom', user: `$(local:user)` },
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'user',
					startupValue: i,
					headline: 'User ID, username, display name, or index',
				},
			],
		}
		presets[`select${i}`] = {
			type: 'simple',
			name: `Styling of user n°${i} + select this user`,
			keywords: ['user', `user${i}`, `${i}`, 'select', 'preview'],
			style: {
				textExpression: true,
				text: "$(label:voice_users_by_index)[$(local:user)]['nick']",
				alignment: 'center:top',
				size: 16,
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			previewStyle: {
				textExpression: false,
				text: `user n°${i}`,
			},
			steps: [
				{
					down: [
						{
							actionId: 'selectUser',
							options: { user: '$(local:user)' },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selectedUser',
					options: { user: '$(local:user)' },
					style: {
						bgcolor: 0x005500,
					},
				},
				{
					feedbackId: 'showImageContent',
					options: { content: 'mix', selected: 'custom', user: '$(local:user)' },
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'user',
					startupValue: i,
					headline: 'User ID, username, display name, or index',
				},
			],
		}
	}
	//endregion

	return [structure, presets]
}
