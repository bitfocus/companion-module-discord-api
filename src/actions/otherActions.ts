import type { CompanionActionDefinitions, CompanionActionSchema } from '@companion-module/base'
import type DiscordInstance from '../index.js'
import { options } from '../utils.js'

export type OtherActionsSchema = {
	otherMute: CompanionActionSchema<
		{
			type: 'Toggle' | 'Mute' | 'Unmute'
			user: string
		},
		void
	>
	otherVolume: CompanionActionSchema<
		{
			type: 'Set' | 'Increase' | 'Decrease'
			volume: number
			user: string
		},
		void
	>
	selectUser: CompanionActionSchema<
		{
			user: string
		},
		void
	>
}

export const getOtherActions = (instance: DiscordInstance): CompanionActionDefinitions<OtherActionsSchema> => {
	return {
		otherMute: {
			name: 'Other - Mute',
			description: 'Set other user Mute state',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'Toggle',
					choices: [
						{ id: 'Toggle', label: 'Toggle' },
						{ id: 'Mute', label: 'Mute' },
						{ id: 'Unmute', label: 'Unmute' },
					],
				},
				{
					type: 'textinput',
					label: 'user',
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user === null || user.user.id === instance.discord.client.user.id) return

				let mute = user.mute

				if (action.options.type === 'Toggle') mute = !mute
				if (action.options.type === 'Mute') mute = true
				if (action.options.type === 'Unmute') mute = false

				await instance.discord.client.setUserVoiceSettings(user.user.id, { mute })
				instance.variables.updateVariables()
			},
		},

		otherVolume: {
			name: 'Other - Volume',
			description: 'Note: For some reason Discord treats volumes between 94.4 and 100 as 100, so increase/decrease outside of that range',
			options: [
				options(instance).adjustmentType,
				options(instance).volume,
				{
					type: 'textinput',
					label: 'user',
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user === null || user.user.id === instance.discord.client.user.id) return

				let volume = action.options.volume

				if (action.options.type !== 'Set') {
					volume = user.volume + (action.options.type === 'Increase' ? volume : -volume)

					if (volume < 0) volume = 0
					if (volume > 200) volume = 200
				}

				await instance.discord.client.setUserVoiceSettings(user.user.id, { volume })
				instance.variables.updateVariables()
			},
		},

		selectUser: {
			name: 'Select User',
			description: 'Select a user to easily reference as a Variable',
			options: [
				{
					type: 'textinput',
					label: 'User',
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user) instance.discord.data.selectedUser = instance.discord.data.selectedUser === user.user.id ? '' : user.user.id

				instance.variables.updateVariables()
				instance.checkFeedbacks('selectedUser', 'otherMute')
			},
		},
	}
}
