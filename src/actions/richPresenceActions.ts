import { type CompanionActionDefinitions, type CompanionActionSchema, createModuleLogger } from '@companion-module/base'
import type DiscordInstance from '../index.js'
import type { RichPresence } from '../client.js'

export type RichPresenceActionsSchema = {
	richPresence: CompanionActionSchema<
		{
			details: string
			state: string
			imgLarge: string
			imgLargeText: string
			imgSmall: string
			imgSmallText: string
			button1Label: string
			button1URL: string
			button2Label: string
			button2URL: string
			startTime: boolean
		},
		void
	>
	clearRichPresence: CompanionActionSchema<{}, void>
}

const log = createModuleLogger('Rich Presence')

export const getRichPresenceActions = (instance: DiscordInstance): CompanionActionDefinitions<RichPresenceActionsSchema> => {
	return {
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

				if (!activity.state || !activity.details) {
					log.warn('Discord Rich Presence must have a State and Details')
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

				log.debug(`Setting activity: ${JSON.stringify(activity)}`)

				return instance.discord.client.setActivity(activity).then()
			},
		},

		clearRichPresence: {
			name: 'Activity - Clear Activity/Rich Presence',
			description: 'Clears the Activity set by this connection',
			options: [],
			callback: async () => {
				log.debug('Clearing activity')
				return instance.discord.client.clearActivity().then()
			},
		},
	}
}
