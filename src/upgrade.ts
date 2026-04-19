import { CompanionStaticUpgradeResult, CompanionStaticUpgradeScript } from '@companion-module/base'
import { Manifest } from './index.js'

const upgradeV1_5_0: CompanionStaticUpgradeScript<Manifest['config']> = (_context, props): CompanionStaticUpgradeResult<Manifest['config'], Manifest['secrets']> => {
	const actions: any = props.actions
	const changes: CompanionStaticUpgradeResult<Manifest['config'], Manifest['secrets']> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	actions.forEach((action: any) => {
		if (action.actionId === 'clearRichPresnce') {
			action.actionId = 'clearRichPresence'
			changes.updatedActions.push(action)
		}
	})

	return changes
}

export const getUpgrades = (): CompanionStaticUpgradeScript<Manifest['config']>[] => {
	return [upgradeV1_5_0]
}
