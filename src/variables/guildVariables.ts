import type { CompanionVariableDefinitions } from '@companion-module/base'
import type DiscordInstance from '../index.js'
import { sanitizeVariableID } from '../utils.js'

export type GuildVariablesSchema = {
	[key: `guild_${number}_icon`]: string
	[key: `guild_${string}_icon`]: string
}

export const guildDefinitions = (instance: DiscordInstance): CompanionVariableDefinitions<GuildVariablesSchema> => {
	const definitions: CompanionVariableDefinitions<GuildVariablesSchema> = {}

	instance.discord.data.guilds.forEach((guild, i) => {
		definitions[`guild_${i}_icon`] = { name: `Guild ${i} Icon` }

		const guildName = sanitizeVariableID(guild.name || '')
		if (guildName) definitions[`guild_${guildName}_icon`] = { name: `${guildName} Icon` }
	})

	return definitions
}

export const guildValues = async (instance: DiscordInstance): Promise<GuildVariablesSchema> => {
	const variables: GuildVariablesSchema = {}

	instance.discord.data.guilds.forEach((guild, i) => {
		variables[`guild_${i}_icon`] = guild.icon_base64 || ''

		const guildName = sanitizeVariableID(guild.name || '')
		if (guildName) variables[`guild_${guildName}_icon`] = guild.icon_base64 || ''
	})

	return variables
}
