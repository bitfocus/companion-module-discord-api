import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type { InstanceTypes } from '../index.js'
import DiscordInstance from '../index.js'

export const getSoundboardDefinitions = (instance: DiscordInstance): CompanionPresetDefinitions<InstanceTypes> => {
	const soundboardDefinitions: CompanionPresetDefinitions<InstanceTypes> = {}

	const sounds = instance.discord.sortedSoundboardChoices()

	sounds.forEach((sound) => {
		const id = `soundboard-${sound.label}`
		soundboardDefinitions[id] = {
			name: `${sound.label}`,
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `${sound.label}`,
				size: 12,
			},
			steps: [
				{
					down: [{ actionId: 'playSoundboard', options: { sound: sound.id + '' } }],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	return soundboardDefinitions
}

export const getSoundboardStructure = (instance: DiscordInstance): CompanionPresetSection<InstanceTypes>[] => {
	const structure: CompanionPresetSection<InstanceTypes>[] = []

	const sounds = instance.discord.sortedSoundboardChoices()

	if (sounds.length > 0) {
		structure.push({
			id: 'presetDiscordSoundboard',
			name: 'Soundboard',
			description: 'Preset for leaving any Voice Channel currently connected to',
			definitions: [],
		})

		const soundboardGuilds: any = {}

		sounds.forEach((sound) => {
			const id = `soundboard-${sound.label}`
			const split = sound.label.split(' - ')

			if (!soundboardGuilds[id]) {
				soundboardGuilds[id] = {
					id,
					type: 'simple',
					name: `${split[0]}`,
					description: `Soundboard for ${split[0]}`,
					presets: [],
				}
			}

			soundboardGuilds[id].presets.push(`soundboard-${sound.label}`)
		})

		Object.values(soundboardGuilds).forEach((definition: any) => {
			structure[0].definitions.push(definition)
		})
	}
	return structure
}
