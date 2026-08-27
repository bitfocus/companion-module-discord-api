import type { CompanionInputFieldDropdown, CompanionInputFieldNumber } from '@companion-module/base'
import type DiscordInstance from './index.js'

export interface Options {
	adjustmentType: CompanionInputFieldDropdown<'type'>
	channelText: CompanionInputFieldDropdown<'channel'>
	channelVoice: CompanionInputFieldDropdown<'channel'>
	volume: CompanionInputFieldNumber<'volume'>
}

export const options = (instance: DiscordInstance): Options => {
	return {
		adjustmentType: {
			type: 'dropdown',
			label: 'Adjustment',
			id: 'type',
			default: 'Set',
			choices: [
				{ id: 'Set', label: 'Set' },
				{ id: 'Increase', label: 'Increase' },
				{ id: 'Decrease', label: 'Decrease' },
			],
			expressionDescription: `Valid Values: 'Set', 'Increase', 'Decrease'`,
		},

		channelText: {
			type: 'dropdown',
			label: 'Channel',
			id: 'channel',
			default: '0',
			choices: [{ id: '0', label: 'Select Channel' }, ...(instance.discord.sortedTextChannelChoices() || [])],
			disableAutoExpression: true,
		},

		channelVoice: {
			type: 'dropdown',
			label: 'Channel',
			id: 'channel',
			default: '0',
			choices: [{ id: '0', label: 'Select Channel' }, ...(instance.discord.sortedVoiceChannelChoices() || [])],
			disableAutoExpression: true,
		},

		volume: {
			type: 'number',
			label: 'Volume',
			id: 'volume',
			default: 100,
			min: 0,
			max: 100,
			expressionDescription: `Valid Values: 0 to 100`,
		},
	}
}
