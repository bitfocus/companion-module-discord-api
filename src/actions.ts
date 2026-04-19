import { CompanionActionDefinitions, CompanionActionSchema, JsonObject } from '@companion-module/base'
import { type UserVoiceSettings } from '@distdev/discord-ipc'
import { RichPresence } from './client.js'
import DiscordInstance, { Manifest } from './index.js'
import { generateWebhookOptions, webhookAction, WebhookActionValues } from './webhook.js'

type muteType = 'toggle' | 'mute' | 'unmute'
type deafenType = 'toggle' | 'deafen' | 'undeafen'
type volumeType = 'set' | 'increase' | 'decrease'

export type DiscordActions = {
	selfMute: CompanionActionSchema<{ type: muteType }>
	selfDeafen: CompanionActionSchema<{ type: deafenType }>
	selfInputVolume: CompanionActionSchema<{ type: volumeType; volume: number }>
	selfOutputVolume: CompanionActionSchema<{ type: volumeType; volume: number }>
	selfInputMode: CompanionActionSchema<{ mode: 'toggle' | 'PUSH_TO_TALK' | 'VOICE_ACTIVITY' }>

	ptt: CompanionActionSchema<{ active: boolean }>
	playSoundboard: CompanionActionSchema<{ sound: '0' | `${number}:${number}` }>

	otherMute: CompanionActionSchema<{ type: muteType; user: string }>
	otherVolume: CompanionActionSchema<{ type: volumeType; volume: number; user: string }>

	selectUser: CompanionActionSchema<{ user: string }>

	joinVoiceChannel: CompanionActionSchema<{ channel: `${number}`; force: boolean; leave: boolean }>
	leaveCurrentVoiceChannel: CompanionActionSchema<JsonObject>
	joinTextChannel: CompanionActionSchema<{ channel: `${number}` }>

	videoToggleCamera: CompanionActionSchema<JsonObject>
	videoToggleScreenShare: CompanionActionSchema<JsonObject>

	richPresence: CompanionActionSchema<{
		details: string
		state: string
		imgLarge: string
		imgLargeText?: string
		imgSmall: string
		imgSmallText?: string
		button1Label: string
		button1URL: string
		button2Label?: string
		button2URL?: string
		startTime: boolean
	}>
	clearRichPresence: CompanionActionSchema<JsonObject>
	sendWebhookMessage: CompanionActionSchema<WebhookActionValues>
}

export function getActions(instance: DiscordInstance): CompanionActionDefinitions<Manifest['actions']> {
	return {
		//region self
		selfMute: {
			name: 'Self - Mute',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'toggle',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'mute', label: 'Mute' },
						{ id: 'unmute', label: 'Unmute' },
					],
				},
			],
			callback: async (action) => {
				if (instance.discord.data.userVoiceSettings === null) return

				if (instance.discord.data.userVoiceSettings.deaf) {
					if (action.options.type !== 'mute') return instance.discord.client.setVoiceSettings({ mute: false, deaf: false }).then()
				} else {
					let mute = action.options.type === 'mute'
					if (action.options.type === 'toggle') mute = !instance.discord.data.userVoiceSettings.mute
					if (mute === instance.discord.data.userVoiceSettings.mute) return

					return instance.discord.client.setVoiceSettings({ mute }).then()
				}
				return
			},
		},
		selfDeafen: {
			name: 'Self - Deafen',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'toggle',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'deafen', label: 'Deafen' },
						{ id: 'undeafen', label: 'unDeafen' },
					],
				},
			],
			callback: async (action) => {
				let deaf = action.options.type === 'deafen'
				if (action.options.type === 'toggle') deaf = !instance.discord.data.userVoiceSettings!.deaf
				if (instance.discord.data.userVoiceSettings === null || deaf === instance.discord.data.userVoiceSettings.deaf) return

				return instance.discord.client.setVoiceSettings({ deaf }).then()
			},
		},
		selfInputVolume: {
			name: 'Self - Input Volume',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'set',
					choices: [
						{ id: 'set', label: 'Set' },
						{ id: 'increase', label: 'Increase' },
						{ id: 'decrease', label: 'Decrease' },
					],
				},
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					default: 100,
					min: 0,
					max: 100,
				},
			],
			callback: async (action) => {
				if (action.options.type === 'set') {
					return instance.discord.client.setVoiceSettings({ input: { volume: action.options.volume } } as any).then()
				} else {
					const currentVolume = instance.discord.data.userVoiceSettings?.input.volume
					if (currentVolume !== undefined) {
						let newVolume = currentVolume + (action.options.type === 'increase' ? action.options.volume : -action.options.volume)
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
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'set',
					choices: [
						{ id: 'set', label: 'Set' },
						{ id: 'increase', label: 'Increase' },
						{ id: 'decrease', label: 'Decrease' },
					],
				},
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					default: 100,
					min: 0,
					max: 200,
				},
			],
			callback: (action) => {
				if (action.options.type === 'set') {
					instance.discord.client.setVoiceSettings({ output: { volume: action.options.volume } } as any)
				} else {
					const currentVolume = instance.discord.data.userVoiceSettings?.output.volume
					if (currentVolume !== undefined) {
						let newVolume = currentVolume + (action.options.type === 'increase' ? action.options.volume : -action.options.volume)
						if (newVolume < 0) newVolume = 0
						if (newVolume > 200) newVolume = 200

						instance.discord.client.setVoiceSettings({ output: { volume: newVolume } } as any)
					}
				}
			},
		},
		selfInputMode: {
			name: 'Self - Input Mode',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					default: 'toggle',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'PUSH_TO_TALK', label: 'Push to Talk' },
						{ id: 'VOICE_ACTIVITY', label: 'Voice Activity' },
					],
				},
			],
			callback: async (action) => {
				let voiceMode = action.options.mode
				if (voiceMode === 'toggle') voiceMode = instance.discord.data.userVoiceSettings!.mode.type === 'PUSH_TO_TALK' ? 'VOICE_ACTIVITY' : 'PUSH_TO_TALK'

				instance.logger.debug(`Setting Input Mode: ${voiceMode}`)
				instance.discord.data.userVoiceSettings = await instance.discord.client.setVoiceSettings({ mode: { type: voiceMode } } as Partial<UserVoiceSettings>)
				instance.checkFeedbacks('selfInputMode')
			},
		},
		//endregion

		//region voice control
		ptt: {
			name: 'Self - Push to Talk',
			options: [
				{
					type: 'checkbox',
					label: 'Active',
					id: 'active',
					default: true,
				},
			],
			callback: async (action) => {
				instance.logger.debug(`PTT: ${action.options.active}`)
				await instance.discord.client.setPushToTalk(action.options.active).then()
			},
		},
		playSoundboard: {
			name: 'Play Soundboard Sound',
			description: 'Playing cross server soundboard sounds requires Discord Nitro',
			options: [
				{
					type: 'dropdown',
					label: 'Sound',
					id: 'sound',
					default: '0',
					choices: [{ id: '0', label: 'Select Sound' }, ...(instance.discord.sortedSoundboardChioces() || [])],
				},
			],
			callback: async (action) => {
				if (action.options.sound === '0') return

				if (instance.discord.data.voiceChannel) {
					const [guild_id, sound_id] = action.options.sound.split(':')
					instance.logger.debug(`Playing Soundboard - Guild ID ${guild_id} - Sound ID ${sound_id}`)

					return instance.discord.client
						.playSoundboardSound(guild_id, sound_id)
						.catch((err) => {
							if (err?.data) {
								instance.logger.warn(`Error playing Soundboard: ${JSON.stringify(err.data)}`)
							} else {
								instance.logger.warn('Error playing Soundboard')
								instance.logger.debug(err)
							}
						})
						.then()
				}

				return
			},
		},
		//endregion

		//region other users
		otherMute: {
			name: 'Other - Mute',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'toggle',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'mute', label: 'Mute' },
						{ id: 'unmute', label: 'Unmute' },
					],
				},
				{
					type: 'textinput',
					label: 'user',
					useVariables: true,
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user === null || user.user.id === instance.discord.client.user.id) return

				let mute = user.mute

				if (action.options.type === 'toggle') mute = !mute
				if (action.options.type === 'mute') mute = true
				if (action.options.type === 'unmute') mute = false

				await instance.discord.client.setUserVoiceSettings(user.user.id, { mute })
				instance.variables.updateVariables()
			},
		},
		otherVolume: {
			name: 'Other - Volume',
			description: 'Note: For some reason Discord treats volumes between 94.4 and 100 as 100, so increase/decrease outside of that range',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: 'set',
					choices: [
						{ id: 'set', label: 'Set' },
						{ id: 'increase', label: 'Increase' },
						{ id: 'decrease', label: 'Decrease' },
					],
				},
				{
					type: 'number',
					label: 'Volume',
					id: 'volume',
					default: 100,
					min: 0,
					max: 100,
				},
				{
					type: 'textinput',
					label: 'user',
					useVariables: true,
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user === null || user.user.id === instance.discord.client.user.id) return

				let volume = action.options.volume

				if (action.options.type !== 'set') {
					volume = user.volume + (action.options.type === 'increase' ? volume : -volume)

					if (volume < 0) volume = 0
					if (volume > 200) volume = 200
				}

				await instance.discord.client.setUserVoiceSettings(user.user.id, { volume })
				instance.variables.updateVariables()
			},
		},

		selectUser: {
			name: 'Select User',
			options: [
				{
					type: 'textinput',
					label: 'User',
					useVariables: true,
					tooltip: 'User ID, username, display name, or index',
					id: 'user',
					default: '',
				},
			],
			callback: async (action) => {
				const user = await instance.discord.getUser(action.options.user)
				if (user) instance.discord.data.selectedUser = instance.discord.data.selectedUser === user.user.id ? '' : user.user.id

				instance.variables.updateVariables()
				instance.checkFeedbacks('selectedUser', 'otherMute', 'showImageContent')
			},
		},
		//endregion

		//region channel
		joinVoiceChannel: {
			name: 'Join Channel - Voice',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...(instance.discord.sortedVoiceChannelChoices() || [])],
				},
				{
					type: 'checkbox',
					label: 'Force',
					tooltip: 'When enabled allows for changing voice channels while already connected to one',
					id: 'force',
					default: true,
				},
				{
					type: 'checkbox',
					label: 'Leave if already joined',
					tooltip: 'When enabled allows for changing voice channels while already connected to one',
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
			name: 'Leave Current Channel',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) return instance.discord.client.selectVoiceChannel(null).then()

				return
			},
		},
		joinTextChannel: {
			name: 'Join Channel - Text',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: '0',
					choices: [{ id: '0', label: 'Select Channel' }, ...(instance.discord.sortedTextChannelChoices() || [])],
				},
			],
			callback: async (action) => {
				if (action.options.channel === '0') return

				return instance.discord.client.selectTextChannel(action.options.channel).then()
			},
		},
		//endregion

		//region video
		videoToggleCamera: {
			name: 'Video - Toggle Camera',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) {
					instance.logger.debug(`Toggling Camera`)
					await instance.discord.client.toggleVideo().catch((err) => {
						instance.logger.warn(`Error toggling camera: ${err}`)
					})
				}
			},
		},
		videoToggleScreenShare: {
			name: 'Video - Toggle Screen Share',
			options: [],
			callback: async () => {
				if (instance.discord.data.voiceChannel) {
					instance.logger.debug(`Toggling Screen sharing`)
					await instance.discord.client.toggleScreenshare().catch((err) => {
						instance.logger.warn(`Error toggling screen sharing: ${err}`)
					})
				}
			},
		},
		//endregion

		//region other actions
		richPresence: {
			name: 'Activity - Set Activity/Rich Presence',
			description: 'Sets the Activity to show playing your App Name',
			options: [
				{
					type: 'textinput',
					label: 'Details',
					tooltip: 'Line 1 of text',
					id: 'details',
					default: '',
				},
				{
					type: 'textinput',
					label: 'State',
					tooltip: 'Line 2 of text',
					id: 'state',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Large Image',
					tooltip: 'Must match an art asset uploaded to your Discord Developer console',
					id: 'imgLarge',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Large Image Text',
					id: 'imgLargeText',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Small Image',
					tooltip: 'Must match an art asset uploaded to your Discord Developer console',
					id: 'imgSmall',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Small Image Text',
					id: 'imgSmallText',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Button 1 Text',
					id: 'button1Label',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Button 1 URL',
					id: 'button1URL',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Button 2 Text',
					id: 'button2Label',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Button 2 URL',
					id: 'button2URL',
					default: '',
				},
				{
					type: 'checkbox',
					label: 'Show Start Time',
					id: 'startTime',
					default: true,
				},
			],
			callback: async (action) => {
				const activity: RichPresence = {
					state: action.options.state,
					details: action.options.details,
				}

				if (!action.options.state || !action.options.details) {
					instance.logger.warn('Discord Rich Presence must have a State and Details')
					return
				}

				if (action.options.imgLarge) {
					activity.largeImageKey = action.options.imgLarge
					activity.largeImageText = action.options.imgLargeText
				}

				if (action.options.imgSmall) {
					activity.smallImageKey = action.options.imgSmall
					activity.smallImageText = action.options.imgSmallText
				}

				if (action.options.button1Label && action.options.button1URL) {
					activity.buttons = [{ label: action.options.button1Label, url: action.options.button1URL }]

					if (action.options.button2Label && action.options.button2URL) {
						activity.buttons.push({ label: action.options.button2Label, url: action.options.button2URL })
					}
				}

				if (action.options.startTime) activity.startTimestamp = new Date()

				instance.logger.debug(`Setting activity: ${JSON.stringify(activity)}`)

				return instance.discord.client.setActivity(activity).then()
			},
		},
		clearRichPresence: {
			name: 'Activity - Clear Activity/Rich Presence',
			description: 'Clears the Activity set by this connection',
			options: [],
			callback: async () => {
				instance.logger.debug('Clearing activity')
				return instance.discord.client.clearActivity().then()
			},
		},
		sendWebhookMessage: {
			name: 'Webhooks - Send Webhook Message',
			description: 'Sends a message to a Webhook URL set up on a Discord Channel',
			options: generateWebhookOptions(),
			callback: async (action) => webhookAction(instance, action),
		},
		//endregion
	}
}
