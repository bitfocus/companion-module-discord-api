import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import DiscordInstance from '../index.js'
import type { InstanceTypes } from '../index.js'
import { getChannelDefinitions, getChannelStructure } from './channelPresets.js'
import { getOtherDefinitions, getOtherStructure } from './otherPresets.js'
import { getSoundboardDefinitions, getSoundboardStructure } from './soundboardPresets.js'
import { getStatusDefinitions, getStatusStructure } from './statusPresets.js'
import { getSelfDefinitions, getSelfStructure } from './selfPresets.js'
import { getVideoDefinitions, getVideoStructure } from './videoPresets.js'

export const getPresetDefinitions = (instance: DiscordInstance): CompanionPresetDefinitions<InstanceTypes> => {
  const presets: CompanionPresetDefinitions<InstanceTypes> = {
    ...getStatusDefinitions(),
		...getSelfDefinitions(),
		...getOtherDefinitions(instance),
		...getSoundboardDefinitions(instance),
		...getVideoDefinitions(),
		...getChannelDefinitions(instance),
  }

  return presets
}

export const getPresetStructure = async (instance: DiscordInstance): Promise<CompanionPresetSection<InstanceTypes>[]> => [
  ...getStatusStructure(),
	...getSelfStructure(),
	...getOtherStructure(instance),
	...getSoundboardStructure(instance),
	...getSoundboardStructure(instance),
	...getVideoStructure(),
	...getChannelStructure(instance),
]
