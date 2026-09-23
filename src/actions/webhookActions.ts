import type { CompanionActionDefinitions, CompanionActionSchema } from '@companion-module/base'
import type DiscordInstance from '../index.js'
import { generateWebhookOptions, webhookAction } from '../webhook.js'

export type WebhookOptions = {
	url: string
	useCustomBody: boolean
	customBody: string
	username: string
	avatarURL: string
	content: string
	embed: boolean
	[key: `embed${number}Color`]: number
	[key: `embed${number}AuthorName`]: string
	[key: `embed${number}AuthorURL`]: string
	[key: `embed${number}AuthorIconURL`]: string
	[key: `embed${number}Title`]: string
	[key: `embed${number}URL`]: string
	[key: `embed${number}Description`]: string
	[key: `embed${number}Fields`]: number
	[key: `embed${number}Field${number}Name`]: string
	[key: `embed${number}Field${number}Value`]: string
	[key: `embed${number}Field${number}Inline`]: boolean
	[key: `embed${number}ThumbnailURL`]: string
	[key: `embed${number}ImageURL`]: string
	[key: `embed${number}Footer`]: string
	[key: `embed${number}FooterIconURL`]: string
	[key: `embed${number}Timestamp`]: string
	poll: boolean
	pollQuestion: string
	pollDuration: number
	pollMultiSelect: boolean
	[key: `pollAnswer${number}`]: string
	tts: boolean
	allowedMentions: boolean
	allowedMentionsParse: string
	allowedMentionsUsers: string
	allowedMentionsRoles: string
}

export type WebhookActionsSchema = {
	sendWebhookMessage: CompanionActionSchema<WebhookOptions, void>
}

export const getWebhookActions = (instance: DiscordInstance): CompanionActionDefinitions<WebhookActionsSchema> => {
	return {
		sendWebhookMessage: {
			name: 'Webhooks - Send Webhook Message',
			description: 'Sends a message to a Webhook URL set up on a Discord Channel',
			options: generateWebhookOptions(),
			callback: async (action) => webhookAction(instance, action),
		},
	}
}
