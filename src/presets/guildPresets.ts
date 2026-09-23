import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type { InstanceTypes } from '../index.js'
import type DiscordInstance from '../index.js'

export const getGuildDefinitions = (instance: DiscordInstance): CompanionPresetDefinitions<InstanceTypes> => {
	const guildDefinitions: CompanionPresetDefinitions<InstanceTypes> = {
		leaveVoiceChannel: {
			name: 'Leave Current Voice Channel',
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: 'Leave\\nVoice\\nChannel',
				size: '14',
			},
			steps: [
				{
					down: [{ actionId: 'leaveCurrentVoiceChannel', options: {} }],
					up: [],
				},
			],
			feedbacks: [],
		},
	}

	instance.discord.data.channels.forEach((channel) => {
		if (!channel.id) return

		let type
		if (channel.type === 0) {
			type = 'Text'
		} else if (channel.type === 2) {
			type = 'Voice'
		} else {
			return
		}

		const id = `join${type}Channel${channel.id}`
		guildDefinitions[id] = {
			name: `${channel.name}`,
			type: 'simple',
			style: {
				bgcolor: 0x000000,
				color: 0xffffff,
				text: `${channel.name}`,
				size: 12,
			},
			steps: [
				{
					down:
						type === 'Text'
							? [{ actionId: 'joinTextChannel', options: { channel: channel.id } }]
							: [{ actionId: 'joinVoiceChannel', options: { channel: channel.id, force: true, leave: true } }],
					up: [],
				},
			],
			feedbacks: type === 'Text' ? [] : [{ feedbackId: 'voiceChannel', options: { channel: channel.id }, style: { color: 0x000000, bgcolor: 0xff0000 } }],
		}
	})

	instance.discord.data.guilds.forEach((guild, i) => {
		guildDefinitions[`presetGuild${i}Icon1`] = {
			name: `${guild.name} Icon`,
			type: 'layered',
			elements: [
				{
					type: 'image',
					base64Image: `$(${instance.label}:guild_${i}_icon)`,
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		guildDefinitions[`presetGuild${i}Icon2`] = {
			name: `${guild.name} Icon`,
			type: 'layered',
			elements: [
				{
					type: 'image',
					base64Image: `$(${instance.label}:guild_${i}_icon)`,
					x: 15,
					y: 15,
					width: 70,
					height: 70,
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		guildDefinitions[`presetGuild${i}Icon3`] = {
			name: `${guild.name} Icon`,
			type: 'layered',
			elements: [
				{
					type: 'image',
					base64Image: `$(${instance.label}:guild_${i}_icon)`,
					x: 20,
					y: 20,
					width: 60,
					height: 60,
				},
				{
					type: 'text',
					text: `${guild.name}`,
					fontsize: 18,
					valign: 'bottom',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	return guildDefinitions
}

export const getGuildStructure = (instance: DiscordInstance): CompanionPresetSection<InstanceTypes>[] => {
	const guildIcons1 = instance.discord.data.guilds.map((_guild, i) => `presetGuild${i}Icon1`)
	const guildIcons2 = instance.discord.data.guilds.map((_guild, i) => `presetGuild${i}Icon2`)
	const guildIcons3 = instance.discord.data.guilds.map((_guild, i) => `presetGuild${i}Icon3`)

	const structure: CompanionPresetSection<InstanceTypes>[] = [
		{
			id: 'presetDiscordChannels',
			name: 'Leave Voice channels',
			description: 'Preset for leaving any Voice Channel currently connected to',
			definitions: [
				{
					id: 'leaveVoice',
					type: 'simple',
					name: 'Leave current Voice Channel',
					description: '',
					presets: ['leaveVoiceChannel'],
				},
			],
		},
		{
			id: 'presetGuildIcons',
			name: 'Guild Icons',
			description: 'Icons in several styles for all Guilds',
			definitions: [
				{
					id: 'guildIcons1',
					type: 'simple',
					name: 'Full size icons',
					description: '',
					presets: guildIcons1,
				},
				{
					id: 'guildIcons2',
					type: 'simple',
					name: 'Smaller size icons',
					description: '',
					presets: guildIcons2,
				},
				{
					id: 'guildIcons3',
					type: 'simple',
					name: 'Smaller size icons with Guild Name',
					description: '',
					presets: guildIcons3,
				},
			],
		},
	]

	instance.discord.data.guilds
		.sort((a, b) => {
			if ((a.name || '').toLowerCase() < (b.name || '').toLowerCase()) {
				return -1
			} else if ((a.name || '').toLowerCase() > (b.name || '').toLowerCase()) {
				return 1
			}

			return 0
		})
		.forEach((guild, i) => {
			structure.push({
				id: `preset${guild.name}}Channels`,
				name: `${guild.name}`,
				description: 'Preset to for Guild Icon and join specific Text or Voice Channels',
				definitions: [
					{
						id: `preset${guild.name}Icon`,
						type: 'simple',
						name: 'Guild Icon',
						description: '',
						presets: [`presetGuild${i}Icon1`, `presetGuild${i}Icon2`, `presetGuild${i}Icon3`],
					},
					{
						id: `preset${guild.name}Text`,
						type: 'simple',
						name: 'Text Channels',
						description: '',
						presets: [],
					},
					{
						id: `preset${guild.name}Voice`,
						type: 'simple',
						name: 'Voice Channels',
						description: '',
						presets: [],
					},
				],
			})
		})

	instance.discord.data.channels.forEach((channel) => {
		const guildName = instance.discord.data.guildNames.get(channel.guild_id as string)
		const groupIndex = structure.findIndex((group) => group.id === `preset${guildName}}Channels`)
		if (groupIndex === -1) return

		if (channel.type === 0) {
			const definition = structure[groupIndex].definitions[1] as any
			definition.presets.push(`joinTextChannel${channel.id}`)
		} else if (channel.type === 2) {
			const definition = structure[groupIndex].definitions[2] as any
			definition.presets.push(`joinVoiceChannel${channel.id}`)
		}
	})

	return structure
}
