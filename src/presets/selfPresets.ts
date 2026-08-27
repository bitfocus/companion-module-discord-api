import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type { InstanceTypes } from '../index.js'

export const getSelfDefinitions = (): CompanionPresetDefinitions<InstanceTypes> => {
	const selfDefinitions: CompanionPresetDefinitions<InstanceTypes> = {
		selfMute: {
			name: 'Self Mute',
			type: 'simple',
			style: {
				text: 'Self\\nMute',
				size: '14',
				bgcolor: 0x000000,
				color: 0xffffff,
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

		selfDeafen: {
			name: 'Self Deafen',
			type: 'simple',
			style: {
				text: 'Self\\nDeafen',
				size: '14',
				bgcolor: 0x000000,
				color: 0xffffff,
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

		selfInputVol: {
			name: 'Self Input Volume',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nIn Vol\\n$(discord:voice_self_input_volume)',
				size: '14',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfInputVolInc5: {
			name: 'Self Increase Input Volume 5',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nIn Vol\\n+5',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selfInputVolume', options: { type: 'Increase', volume: 5 } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfInputVolInc10: {
			name: 'Self Increase Input Volume 10',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nIn Vol\\n+10',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selfInputVolume', options: { type: 'Increase', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfInputVolDec5: {
			name: 'Self Decrease Input Volume 5',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nIn Vol\\n-5',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selfInputVolume', options: { type: 'Decrease', volume: 5 } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfInputVolDec10: {
			name: 'Self Decrease Input Volume 10',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nIn Vol\\n-10',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selfInputVolume', options: { type: 'Decrease', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfOutputVol: {
			name: 'Self Output Volume',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nOut Vol\\n$(discord:voice_self_output_volume)',
				size: '14',
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfOutputVolInc5: {
			name: 'Self Increase Output Volume 5',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nOut Vol\\n+5',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selfOutputVolume', options: { type: 'Increase', volume: 5 } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfOutputVolInc10: {
			name: 'Self Increase Output Volume 10',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nOut Vol\\n+10',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selfOutputVolume', options: { type: 'Increase', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfOutputVolDec5: {
			name: 'Self Decrease Output Volume 5',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nOut Vol\\n-5',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selfOutputVolume', options: { type: 'Decrease', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfOutputVolDec10: {
			name: 'Self Decrease Output Volume 10',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Self\\nOut Vol\\n-10',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selfOutputVolume', options: { type: 'Decrease', volume: 10 } }],
					up: [],
				},
			],
			feedbacks: [],
		},

		selfInputMode: {
			name: 'Voice Input Mode',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Voice Input Toggle',
				size: '14',
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

		selfPTT: {
			name: 'Push to Talk',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'PTT',
				size: '14',
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

		selfPTTToggle: {
			name: 'Push to Talk Toggle',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'PTT Toggle',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'ptt', options: { active: true } }],
					up: [],
				},
				{
					down: [{ actionId: 'ptt', options: { active: false } }],
					up: [],
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
	}

	return selfDefinitions
}

export const getSelfStructure = (): CompanionPresetSection<InstanceTypes>[] => {
	const structure: CompanionPresetSection<InstanceTypes>[] = [
		{
			id: 'presetSelf',
			name: 'Self Voice control',
			description: 'Presets for Self audio state and volume',
			definitions: [
				{
					id: 'selfMuteDeafen',
					type: 'simple',
					name: 'Mic Control',
					description: '',
					presets: ['selfMute', 'selfDeafen', 'selfInputMode', 'selfPTT', 'selfPTTToggle'],
				},
				{
					id: 'selfInputVolume',
					type: 'simple',
					name: 'Input Volume',
					description: '',
					presets: ['selfInputVol', 'selfInputVolInc5', 'selfInputVolInc10', 'selfInputVolDec5', 'selfInputVolDec10'],
				},
				{
					id: 'selfOutputVolume',
					type: 'simple',
					name: 'Output Volume',
					description: '',
					presets: ['selfOutputVol', 'selfOutputVolInc5', 'selfOutputVolInc10', 'selfOutputVolDec5', 'selfOutputVolDec10'],
				},
			],
		},
	]

	return structure
}
