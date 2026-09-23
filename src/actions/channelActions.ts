import type { CompanionActionDefinitions, CompanionActionSchema } from '@companion-module/base'
import type DiscordInstance from '../index.js'
import { options } from '../utils.js'

export type ChannelActionsSchema = {
	joinVoiceChannel: CompanionActionSchema<
		{
			channel: string
			force: boolean
			leave: boolean
		},
		void
	>
	leaveCurrentVoiceChannel: CompanionActionSchema<Record<string, never>, void>
	joinTextChannel: CompanionActionSchema<
		{
			channel: string
		},
		void
	>
}

export const getChannelActions = (instance: DiscordInstance): CompanionActionDefinitions<ChannelActionsSchema> => {
	return {
		joinVoiceChannel: {
			name: 'Channels - Join Voice Channel',
			description: 'Joins the selected Voice channel',
			options: [
				options(instance).channelVoice,
				{
					type: 'checkbox',
					label: 'Force',
					description: 'When enabled allows for changing voice channels while already connected to one',
					id: 'force',
					default: true,
				},
				{
					type: 'checkbox',
					label: 'Leave if already joined',
					description: 'When enabled allows for changing voice channels while already connected to one',
					id: 'leave',
					default: true,
				},
			],
			callback: async (action) => {
				if (action.options.channel === '0') return

				if (action.options.channel !== instance.discord.data.voiceChannel?.id) {
					return instance.discord.client.selectVoiceChannel(action.options.channel, { force: action.options.force }).then()
				} else {
					if (action.options.leave) return instance.discord.client.selectVoiceChannel(null, { force: action.options.force }).then()
				}

				return
			},
		},

		leaveCurrentVoiceChannel: {
			name: 'Channels - Leave current Channel',
			description: 'Leaves the current Voice channel',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) return instance.discord.client.selectVoiceChannel(null).then()
				return
			},
		},

		joinTextChannel: {
			name: 'Channels - Join Text Channel',
			description: 'Sets Discord to view the selected Text Channel',
			options: [options(instance).channelText],
			callback: async (action) => {
				if (action.options.channel === '0') return

				return instance.discord.client.selectTextChannel(action.options.channel).then()
			},
		},
	}
}
