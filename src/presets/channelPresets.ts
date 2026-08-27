import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import type { InstanceTypes } from '../index.js'
import DiscordInstance from '../index.js'

export const getChannelDefinitions = (instance: DiscordInstance): CompanionPresetDefinitions<InstanceTypes> => {
	const channelDefinitions: CompanionPresetDefinitions<InstanceTypes> = {
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

		let type = ''
		if (channel.type === 0) {
			type = 'Text'
		} else if (channel.type === 2) {
			type = 'Voice'
		} else {
			return
		}

		const id = `join${type}Channel${channel.id}`
		channelDefinitions[id] = {
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

	return channelDefinitions
}

export const getChannelStructure = (instance: DiscordInstance): CompanionPresetSection<InstanceTypes>[] => {
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
		.forEach((guild) => {
			structure.push({
				id: `preset${guild.name}}Channels`,
				name: `${guild.name} Channels`,
				description: 'Preset to join specific Text or Voice Channels',
				definitions: [
					{
						id: `preset${guild.name}}Text`,
						type: 'simple',
						name: 'Text Channels',
						description: '',
						presets: [],
					},
					{
						id: `preset${guild.name}}Voice`,
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
			const definition = structure[groupIndex].definitions[0] as any
			definition.presets.push(`joinTextChannel${channel.id}`)
		} else if (channel.type === 2) {
			const definition = structure[groupIndex].definitions[1] as any
			definition.presets.push(`joinVoiceChannel${channel.id}`)
		}
	})

	return structure
}
