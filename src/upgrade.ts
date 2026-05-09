import { CompanionStaticUpgradeResult, CompanionStaticUpgradeScript } from '@companion-module/base'
import { Manifest } from './index.js'

const upgradeV1_5_0: CompanionStaticUpgradeScript<Manifest['config']> = (_context, props): CompanionStaticUpgradeResult<Manifest['config'], Manifest['secrets']> => {
	const changes: CompanionStaticUpgradeResult<Manifest['config'], Manifest['secrets']> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	props.actions.forEach((action) => {
		if (action.actionId === 'clearRichPresnce') {
			action.actionId = 'clearRichPresence'
			changes.updatedActions.push(action)
		}
	})

	return changes
}
const upgradeV1_6_0: CompanionStaticUpgradeScript<Manifest['config']> = (_context, props): CompanionStaticUpgradeResult<Manifest['config'], Manifest['secrets']> => {
	const changes: CompanionStaticUpgradeResult<Manifest['config'], Manifest['secrets']> = {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	props.feedbacks.forEach((feedback) => {
		if (feedback.feedbackId === 'voiceStyling') {
			feedback.feedbackId = 'showImageContent'
			feedback.options.content = { isExpression: false, value: 'mix' }
			feedback.options.selected = { isExpression: false, value: 'custom' }
			changes.updatedFeedbacks.push(feedback)
		}
	})

	return changes
}

export const getUpgrades = (): CompanionStaticUpgradeScript<Manifest['config']>[] => {
	return [upgradeV1_5_0, upgradeV1_6_0]
}
