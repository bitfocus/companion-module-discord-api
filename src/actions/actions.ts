import type { CompanionActionDefinitions } from '@companion-module/base'
import type DiscordInstance from '../index.js'
import { type ChannelActionsSchema, getChannelActions } from './channelActions.js'
import { type OtherActionsSchema, getOtherActions } from './otherActions.js'
import { type RichPresenceActionsSchema, getRichPresenceActions } from './richPresenceActions.js'
import { type SelfActionsSchema, getSelfActions } from './selfActions.js'
import { type SoundboardActionsSchema, getSoundboardActions } from './soundboardActions.js'
import { type VideoActionsSchema, getVideoActions } from './videoActions.js'
import { type WebhookActionsSchema, getWebhookActions } from './webhookActions.js'

export type ActionsSchema = ChannelActionsSchema &
	OtherActionsSchema &
	RichPresenceActionsSchema &
	SelfActionsSchema &
	SoundboardActionsSchema &
	VideoActionsSchema &
	WebhookActionsSchema

export type ActionsSchema2 = {}

export const getActions = (instance: DiscordInstance): CompanionActionDefinitions<ActionsSchema> => {
	return {
		...getChannelActions(instance),
		...getOtherActions(instance),
		...getRichPresenceActions(instance),
		...getSelfActions(instance),
		...getSoundboardActions(instance),
		...getVideoActions(instance),
		...getWebhookActions(instance),
	}
}
