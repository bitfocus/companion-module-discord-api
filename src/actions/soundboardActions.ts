import { type CompanionActionDefinitions, type CompanionActionSchema, createModuleLogger } from '@companion-module/base'
import type DiscordInstance from '../index.js'

export type SoundboardActionsSchema = {
	playSoundboard: CompanionActionSchema<
		{
			sound: string
		},
		void
	>
}

const log = createModuleLogger('Actions')

export const getSoundboardActions = (instance: DiscordInstance): CompanionActionDefinitions<SoundboardActionsSchema> => {
	return {
		playSoundboard: {
			name: 'Soundboard - Play Sound',
			description: 'Playing cross server soundboard sounds requires Discord Nitro',
			options: [
				{
					type: 'dropdown',
					label: 'Sound',
					id: 'sound',
					default: '0',
					choices: [{ id: '0', label: 'Select Sound' }, ...(instance.discord.sortedSoundboardChoices() || [])],
				},
			],
			callback: async (action) => {
				if (action.options.sound === '0') return

				if (instance.discord.data.voiceChannel) {
					const [guild_id, sound_id] = action.options.sound.split(':')
					log.debug(`Playing Soundboard - Guild ID ${guild_id} - Sound ID ${sound_id}`)

					return instance.discord.client
						.playSoundboardSound(guild_id, sound_id)
						.catch((err: any) => {
							if (err?.data) {
								log.warn(`Error playing Soundboard: ${JSON.stringify(err.data)}`)
							} else {
								log.warn('Error playing Soundboard')
								log.debug(err)
							}
						})
						.then()
				}

				return
			},
		},
	}
}
