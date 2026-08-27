import type { CompanionPresetDefinitions, CompanionPresetGroup, CompanionPresetSection } from '@companion-module/base'
import type { InstanceTypes } from '../index.js'
import DiscordInstance from '../index.js'

export const getOtherDefinitions = (instance: DiscordInstance): CompanionPresetDefinitions<InstanceTypes> => {
	const otherDefinitions: CompanionPresetDefinitions<InstanceTypes> = {
		selectedUserMute: {
			name: 'Selected User Mute',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Toggle\\nUser\\nMute',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'otherMute', options: { type: 'Toggle', user: `$(label:voice_user_selected_id)` } }],
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

		selectedUserVolInc: {
			name: 'Increase Selected User Volume',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Vol\\n+10',
				size: '14',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherVolume',
							options: { type: 'Increase', volume: 10, user: `$(label:voice_user_selected_id)` },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},

		selectedUserVolDec: {
			name: 'Decrease Selected User Volume',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Vol\\n-10',
				size: '14',
			},
			steps: [
				{
					down: [
						{
							actionId: 'otherVolume',
							options: { type: 'Decrease', volume: 10, user: `$(label:voice_user_selected_id)` },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		},
	}

	instance.discord.sortedVoiceUsers().forEach((user, index) => {
		otherDefinitions[`selectUser${index}`] = {
			name: `Select User ${user.nick || user.user.username}`,
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `${user.nick || user.user.username}`,
				alignment: 'center:bottom',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'selectUser', options: { user: index + '' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'selectedUser',
					options: { user: index + '' },
					style: { color: 0xffffff, bgcolor: 0xff0000 },
				},
				{
					feedbackId: 'voiceStyling',
					options: { user: index + '' },
				},
			],
		}
	})

	return otherDefinitions
}

export const getOtherStructure = (instance: DiscordInstance): CompanionPresetSection<InstanceTypes>[] => {
	const structure: CompanionPresetSection<InstanceTypes>[] = [
		{
			id: 'presetOthers',
			name: 'Other User Voice control',
			description: 'Other User selection and Voice Control',
			definitions: [
				{
					id: 'othersVolume',
					type: 'simple',
					name: 'Selected User Mute / Volume',
					description: '',
					presets: ['selectedUserMute', 'selectedUserVolInc', 'selectedUserVolDec'],
				},
			],
		},
	]

	const voiceUsers = instance.discord.sortedVoiceUsers()
	if (voiceUsers.length > 0) {
		const selectUserStructure: CompanionPresetGroup<InstanceTypes> = {
			id: 'othersSelectUser',
			type: 'simple',
			name: 'Select Voice Channel User',
			description: 'Shows the status of users in the current Voice Channel and allows selection for use in selected user mute/volume control',
			presets: [],
		}

		voiceUsers.forEach((_user, index) => {
			selectUserStructure.presets.push(`selectUser${index}`)
		})

		structure[0].definitions[1] = selectUserStructure
	}

	return structure
}
