import type { CompanionFeedbackDefinitions, StringKeys } from '@companion-module/base'
import type DiscordInstance from '../index.js'
import { type OtherFeedbackSchema, getOtherFeedbacks } from './otherFeedbacks.js'
import { type SelfFeedbacksSchema, getSelfFeedbacks } from './selfFeedbacks.js'
import { type VideoFeedbacksSchema, getVideoFeedbacks } from './videoFeedbacks.js'
import { type VoiceFeedbacksSchema, getVoiceFeedbacks } from './voiceFeedback.js'

export type FeedbacksSchema = OtherFeedbackSchema & SelfFeedbacksSchema & VideoFeedbacksSchema & VoiceFeedbacksSchema

export type FeedbackId = StringKeys<FeedbacksSchema>

export function getFeedbacks(instance: DiscordInstance): CompanionFeedbackDefinitions<FeedbacksSchema> {
	return {
		...getOtherFeedbacks(instance),
		...getSelfFeedbacks(instance),
		...getVideoFeedbacks(instance),
		...getVoiceFeedbacks(instance),
	}
}
