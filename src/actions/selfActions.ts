import { type CompanionActionDefinitions, type CompanionActionSchema, createModuleLogger } from '@companion-module/base'
import type { UserVoiceSettings } from '@distdev/discord-ipc'
import type DiscordInstance from '../index.js'
import { options } from '../utils.js'

export type SelfActionsSchema = {
	selfMute: CompanionActionSchema<
		{
			type: 'Toggle' | 'Mute' | 'Unmute'
		},
		void
	>
	selfDeafen: CompanionActionSchema<
		{
			type: 'Toggle' | 'Deafen' | 'Undeafen'
		},
		void
	>
	selfInputVolume: CompanionActionSchema<
		{
			type: 'Set' | 'Increase' | 'Decrease'
			volume: number
		},
		void
	>
	selfOutputVolume: CompanionActionSchema<
		{
			type: 'Set' | 'Increase' | 'Decrease'
			volume: number
		},
		void
	>
	selfInputMode: CompanionActionSchema<
		{
			mode: 'Toggle' | 'PUSH_TO_TALK' | 'VOICE_ACTIVITY'
		},
		void
	>
	ptt: CompanionActionSchema<
		{
			active: boolean
		},
		void
	>
}

const log = createModuleLogger('Actions')

export const getSelfActions = (instance: DiscordInstance): CompanionActionDefinitions<SelfActionsSchema> => {
	return {
		selfMute: {
			name: 'Self - Mute',
			description: 'Set own Mute state',
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
					expressionDescription: `Valid Values: 'Toggle', 'Mute', or 'Unmute'`,
				},
			],
			callback: async (action) => {
				if (instance.discord.data.userVoiceSettings === null) return

				if (instance.discord.data.userVoiceSettings.deaf) {
					if (action.options.type !== 'Mute') return instance.discord.client.setVoiceSettings({ mute: false, deaf: false }).then()
				} else {
					let mute = action.options.type === 'Mute'
					if (action.options.type === 'Toggle') mute = !instance.discord.data.userVoiceSettings.mute
					if (mute === instance.discord.data.userVoiceSettings.mute) return

					return instance.discord.client.setVoiceSettings({ mute }).then()
				}
				return
			},
		},

		selfDeafen: {
			name: 'Self - Deafen',
			description: 'Set own Deafen state',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'Toggle',
					choices: [
						{ id: 'Toggle', label: 'Toggle' },
						{ id: 'Deafen', label: 'Deafen' },
						{ id: 'unDeafen', label: 'unDeafen' },
					],
					expressionDescription: `Valid Values: 'Toggle', 'Deafen', or 'unDeafen'`,
				},
			],
			callback: async (action) => {
				let deaf = action.options.type === 'Deafen'
				if (action.options.type === 'Toggle') deaf = !instance.discord.data.userVoiceSettings!.deaf
				if (instance.discord.data.userVoiceSettings === null || deaf === instance.discord.data.userVoiceSettings.deaf) return

				return instance.discord.client.setVoiceSettings({ deaf }).then()
			},
		},

		selfInputVolume: {
			name: 'Self - Input Volume',
			description: 'Set own Input Volume state',
			options: [options(instance).adjustmentType, options(instance).volume],
			callback: async (action) => {
				if (action.options.type === 'Set') {
					return instance.discord.client.setVoiceSettings({ input: { volume: action.options.volume } } as any).then()
				} else {
					const currentVolume = instance.discord.data.userVoiceSettings?.input.volume
					if (currentVolume !== undefined) {
						let newVolume = currentVolume + (action.options.type === 'Increase' ? action.options.volume : -action.options.volume)
						if (newVolume < 0) newVolume = 0
						if (newVolume > 100) newVolume = 100

						return instance.discord.client.setVoiceSettings({ input: { volume: newVolume } } as any).then()
					}

					return
				}
			},
		},

		selfOutputVolume: {
			name: 'Self - Output Volume',
			description: 'Set own Output Volume state',
			options: [
				options(instance).adjustmentType,
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					default: 100,
					min: 0,
					max: 200,
					expressionDescription: `Valid Values: 0 to 200`,
				},
			],
			callback: (action) => {
				if (action.options.type === 'Set') {
					instance.discord.client.setVoiceSettings({ output: { volume: action.options.volume } } as any)
				} else {
					const currentVolume = instance.discord.data.userVoiceSettings?.output.volume
					if (currentVolume !== undefined) {
						let newVolume = currentVolume + (action.options.type === 'Increase' ? action.options.volume : -action.options.volume)
						if (newVolume < 0) newVolume = 0
						if (newVolume > 200) newVolume = 200

						instance.discord.client.setVoiceSettings({ output: { volume: newVolume } } as any)
					}
				}
			},
		},

		selfInputMode: {
			name: 'Self - Input Mode',
			description: 'Set own PTT/Voice ACtivity state',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					default: 'Toggle',
					choices: [
						{ id: 'Toggle', label: 'Toggle' },
						{ id: 'PUSH_TO_TALK', label: 'Push to Talk' },
						{ id: 'VOICE_ACTIVITY', label: 'Voice Activity' },
					],
					expressionDescription: `Valid Values: 'Toggle', 'PUSH_TO_TALK', 'VOICE_ACTIVITY'`,
				},
			],
			callback: async (action) => {
				let voiceMode = action.options.mode
				if (voiceMode === 'Toggle') voiceMode = instance.discord.data.userVoiceSettings!.mode.type === 'PUSH_TO_TALK' ? 'VOICE_ACTIVITY' : 'PUSH_TO_TALK'

				log.debug(`Setting Input Mode: ${voiceMode}`)
				const newVoiceSettings = await instance.discord.client.setVoiceSettings({ mode: { type: voiceMode } } as Partial<UserVoiceSettings>)
				instance.discord.data.userVoiceSettings = newVoiceSettings
				instance.checkFeedbacks('selfInputMode')
			},
		},

		ptt: {
			name: 'Self - Push to Talk',
			description: 'Activate/Deactivate PTT',
			options: [
				{
					type: 'checkbox',
					label: 'Active',
					id: 'active',
					default: true,
				},
			],
			callback: async (action) => {
				log.debug(`PTT: ${action.options.active}`)
				await instance.discord.client.setPushToTalk(action.options.active).then()
			},
		},
	}
}
