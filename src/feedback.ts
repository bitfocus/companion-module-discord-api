import DiscordInstance, { Manifest } from './index.js'
import { graphics } from 'companion-module-utils'
import { CompanionAdvancedFeedbackResult, CompanionFeedbackDefinitions, CompanionFeedbackSchema, JsonObject } from '@companion-module/base'
import { scaleIconBuffer, urlToPng64 } from './utilFetchImage.js'

export type DiscordFeedbacks = {
	selfMute: CompanionFeedbackSchema<JsonObject>
	selfDeaf: CompanionFeedbackSchema<JsonObject>
	selfInputMode: CompanionFeedbackSchema<{ state: 'PUSH_TO_TALK' | 'VOICE_ACTIVITY' }>
	selfMicActive: CompanionFeedbackSchema<JsonObject>
	otherMicActive: CompanionFeedbackSchema<{ user: string }>
	otherMute: CompanionFeedbackSchema<{ user: string }>
	otherDeaf: CompanionFeedbackSchema<{ user: string }>
	voiceChannel: CompanionFeedbackSchema<{ channel: `${number}` }>
	selectedUser: CompanionFeedbackSchema<{ user: string }>
	videoCamera: CompanionFeedbackSchema<JsonObject>
	videoScreenShare: CompanionFeedbackSchema<JsonObject>
	showImageContent: CompanionFeedbackSchema<{ content: 'guild' | 'avatar' | 'mic' | 'headphone' | 'mix'; selected: 'selected' | 'self' | 'custom'; user?: string }>
}

export function getFeedbacks(instance: DiscordInstance): CompanionFeedbackDefinitions<Manifest['feedbacks']> {
	return {
		selfMute: {
			type: 'boolean',
			name: 'Voice - Self Mute',
			description: `Indicates if you've muted yourself`,
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: () => {
				return instance.discord.data.userVoiceSettings?.mute || instance.discord.data.userVoiceSettings?.deaf || false
			},
		},

		selfDeaf: {
			type: 'boolean',
			name: 'Voice - Self Deaf',
			description: `Indicates if you've deafened yourself`,
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: () => {
				return instance.discord.data.userVoiceSettings?.deaf || false
			},
		},

		selfInputMode: {
			type: 'boolean',
			name: 'Voice - Self Input Mode',
			description: `Indicates if you've deafened yourself`,
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 'PUSH_TO_TALK',
					choices: [
						{ id: 'PUSH_TO_TALK', label: 'Push To Talk' },
						{ id: 'VOICE_ACTIVITY', label: 'Voice Activity' },
					],
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: (feedback) => {
				return instance.discord.data.userVoiceSettings?.mode.type === feedback.options.state
			},
		},

		selfMicActive: {
			type: 'boolean',
			name: 'Voice - Self Mic Active',
			description: 'Indicate if your mic is active such as PTT being pressed, or Voice Activity level being reached',
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: () => {
				return instance.discord.data.speaking.has(instance.discord.client.user?.id)
			},
		},

		otherMicActive: {
			type: 'boolean',
			name: 'Voice - Other Mic Active',
			description: 'Indicate if a users mic is active such as PTT being pressed, or Voice Activity level being reached',
			options: [
				{
					type: 'textinput',
					label: 'user',
					useVariables: true,
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: async (feedback) => {
				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(feedback.options.user, 10)) && parseInt(feedback.options.user, 10) === index) return true
					return (
						feedback.options.user === voiceState.user.id ||
						feedback.options.user === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						feedback.options.user === voiceState.nick
					)
				})

				if (!voiceUser) return false
				return instance.discord.data.speaking.has(voiceUser.user.id)
			},
		},

		otherMute: {
			type: 'boolean',
			name: 'Voice - Other Mute',
			description: 'Indicates if another user is muted',
			options: [
				{
					type: 'textinput',
					label: 'user',
					useVariables: true,
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: async (feedback) => {
				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(feedback.options.user, 10)) && parseInt(feedback.options.user, 10) === index) return true
					return (
						feedback.options.user === voiceState.user.id ||
						feedback.options.user === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						feedback.options.user === voiceState.nick
					)
				})

				return voiceUser?.mute || voiceUser?.voice_state.mute || voiceUser?.voice_state.self_mute || false
			},
		},

		otherDeaf: {
			type: 'boolean',
			name: 'Voice - Other Deaf',
			description: 'Indicates if another user is deafened',
			options: [
				{
					type: 'textinput',
					label: 'user',
					useVariables: true,
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: async (feedback) => {
				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(feedback.options.user, 10)) && parseInt(feedback.options.user, 10) === index) return true
					return (
						feedback.options.user === voiceState.user.id ||
						feedback.options.user === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						feedback.options.user === voiceState.nick
					)
				})

				return voiceUser?.voice_state.deaf || voiceUser?.voice_state.self_deaf || false
			},
		},

		voiceChannel: {
			type: 'boolean',
			name: 'Voice - Channel',
			description: `Indicates if you're in the specified Voice Channel`,
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...(instance.discord.sortedVoiceChannelChoices() || [])],
				},
			],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0x00ff00,
			},
			callback: (feedback) => {
				return feedback.options.channel === instance.discord.data.voiceChannel?.id
			},
		},

		selectedUser: {
			type: 'boolean',
			name: 'Selected User',
			description: 'Indicates currently selected user',
			options: [
				{
					type: 'textinput',
					label: 'user',
					useVariables: true,
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
				},
			],
			defaultStyle: {
				color: 0xffffff,
				bgcolor: 0x006400,
			},
			callback: async (feedback) => {
				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(feedback.options.user, 10)) && parseInt(feedback.options.user, 10) === index) return true
					return (
						feedback.options.user === voiceState.user.id ||
						feedback.options.user === `${voiceState.user.username}#${voiceState.user.discriminator}` ||
						feedback.options.user === voiceState.nick
					)
				})

				return voiceUser?.user.id === instance.discord.data.selectedUser || false
			},
		},

		videoCamera: {
			type: 'boolean',
			name: 'Video - Camera Active',
			description: 'Indicates if video sharing is active',
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: () => {
				return instance.discord.data.videoActive
			},
		},

		videoScreenShare: {
			type: 'boolean',
			name: 'Video - Screen Share Active',
			description: 'Indicates if screen sharing is active',
			options: [],
			defaultStyle: {
				color: 0x000000,
				bgcolor: 0xff0000,
			},
			callback: () => {
				return instance.discord.data.screenShareActive
			},
		},

		showImageContent: {
			type: 'advanced',
			name: 'Content background',
			description: 'Use content as background (Guild icon, user avatar, user mic or user headphone)',
			options: [
				{
					type: 'dropdown',
					label: 'Content',
					tooltip: 'Choose wich content you want to show',
					id: 'content',
					default: 'guild',
					choices: [
						{ id: 'guild', label: 'Guild icon' },
						{ id: 'avatar', label: 'User avatar' },
						{ id: 'mic', label: 'User mic' },
						{ id: 'headphone', label: 'User headphone' },
						{ id: 'mix', label: 'User mic and headphone' },
					],
					disableAutoExpression: true,
				},
				{
					type: 'dropdown',
					label: 'Selected user ?',
					tooltip: 'if true, use the selected user, otherise, use custom user',
					id: 'selected',
					default: 'self',
					disableAutoExpression: true,
					isVisibleExpression: `$(options:content) !== 'guild'`,
					choices: [
						{ id: 'selected', label: 'Selected user' },
						{ id: 'self', label: 'Self user' },
						{ id: 'custom', label: 'Custom user' },
					],
				},
				{
					type: 'textinput',
					label: 'user',
					useVariables: true,
					tooltip: 'User ID, name#discriminator, nick, or index',
					id: 'user',
					default: '',
					isVisibleExpression: `$(options:content) !== 'guild' && $(options:selected) === 'custom'`,
				},
			],
			callback: async (feedback): Promise<CompanionAdvancedFeedbackResult> => {
				if (!feedback.image) return {}

				if (feedback.options.content === 'guild') {
					const guild = instance.discord.data.guilds.find((e) => e.id === instance.discord.data.voiceChannel?.guild_id)
					const guildIconUrl = guild?.icon_url?.replace('.webp', '.png')?.replace(/\?size=\d+/, '')
					if (!guildIconUrl) return {}

					try {
						const png64 = await urlToPng64(guildIconUrl, feedback.image.width, feedback.image.height)
						if (!png64) return {}

						return { png64 }
					} catch (error) {
						instance.logger.warn(`Failed to convert guild icon: ${error}`)
						return {}
					}
				}

				const userOption =
					feedback.options.selected === 'custom'
						? feedback.options.user
						: feedback.options.selected === 'selected'
							? instance.discord.data.selectedUser
							: instance.discord.client.user.id
				if (!userOption) return {}

				const voiceUser = instance.discord.sortedVoiceUsers().find((voiceState: any, index: number) => {
					if (!isNaN(parseInt(userOption, 10)) && parseInt(userOption, 10) === index) return true
					return userOption === voiceState.user.id || userOption === `${voiceState.user.username}#${voiceState.user.discriminator}` || userOption === voiceState.nick
				})
				if (!voiceUser) return {}

				let mute: 'mic1' | 'mic2' | 'mic3' | 'mic4' | 'mic5' = 'mic1'
				let deaf: 'headset1' | 'headset2' | 'headset3' | 'headset4' = 'headset1'

				if (voiceUser.voice_state.self_mute || voiceUser.voice_state.suppress) mute = 'mic2'
				if (voiceUser.mute) mute = 'mic3'
				if (instance.discord.data.speaking.has(voiceUser.user.id)) mute = 'mic5'
				if (voiceUser.voice_state.mute) mute = 'mic4'
				if (voiceUser.voice_state.self_deaf) deaf = 'headset2'
				if (voiceUser.voice_state.deaf) deaf = 'headset4'

				switch (feedback.options.content) {
					case 'avatar': {
						if (!voiceUser.user.avatar) return {}

						const avatarUrl = `https://cdn.discordapp.com/avatars/${voiceUser.user.id}/${voiceUser.user.avatar}.png`

						try {
							const png64 = await urlToPng64(avatarUrl, feedback.image.width, feedback.image.height)
							if (!png64) return {}

							return { png64 }
						} catch (error) {
							instance.logger.warn(`Failed to convert user avatar: ${error}`)
							return {}
						}
					}
					case 'mic': {
						const micIconNative = graphics.icon({
							width: 32,
							height: 32,
							type: mute,
							offsetX: 5,
						})

						const scaledMicIcon = scaleIconBuffer(micIconNative, 32, 32, feedback.image.width, feedback.image.height)

						return {
							imageBuffer: (Buffer.from(scaledMicIcon) as any).toString('base64'),
						}

						return {}
					}
					case 'headphone': {
						const headsetIconNative = graphics.icon({
							width: 32,
							height: 32,
							type: deaf,
							offsetX: 1,
						})

						const scaledHeadsetIcon = scaleIconBuffer(headsetIconNative, 32, 32, feedback.image.width, feedback.image.height)

						return {
							imageBuffer: (Buffer.from(scaledHeadsetIcon) as any).toString('base64'),
						}

						return {}
					}
					case 'mix': {
						const micIcon = graphics.icon({
							width: feedback.image.width,
							height: feedback.image.height,
							type: mute,
							offsetX: 13,
							offsetY: feedback.image.height === 72 ? 38 : 24,
						})

						const headsetIcon = graphics.icon({
							width: feedback.image.width,
							height: feedback.image.height,
							type: deaf,
							offsetX: 35,
							offsetY: feedback.image.height === 72 ? 38 : 24,
						})

						return {
							imageBuffer: (graphics.stackImage([micIcon, headsetIcon]) as any).toString('base64'),
						}
					}
					default:
						return {}
				}
			},
		},
	}
}
