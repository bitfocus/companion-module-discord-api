import type { CompanionActionDefinitions, CompanionActionSchema } from '@companion-module/base'
import type DiscordInstance from '../index.js'
import { generateWebhookOptions, webhookAction } from '../webhook.js'

export type WebhookActionsSchema = {
	sendWebhookMessage: CompanionActionSchema<
		{
			[key: string]: string | number | boolean
		},
		void
	>
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
