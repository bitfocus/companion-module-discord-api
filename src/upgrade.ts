import { CompanionStaticUpgradeResult, CompanionStaticUpgradeScript } from '@companion-module/base'
import type { Config } from './config.js'

const upgradeV1_5_0: CompanionStaticUpgradeScript<Config> = (_context, props): CompanionStaticUpgradeResult<Config, undefined> => {
  const changes: CompanionStaticUpgradeResult<Config, undefined> = {
    updatedConfig: null,
    updatedSecrets: null,
    updatedActions: [],
    updatedFeedbacks: [],
  }

	for (const action of props.actions) {
		if (action.actionId === 'clearRichPresnce') {
			action.actionId = 'clearRichPresence'
			changes.updatedActions.push(action)
		}
	}

	return changes
}

/*const upgradeV2_0_0: CompanionStaticUpgradeScript<Config> = (_context, props): CompanionStaticUpgradeResult<Config, undefined> => {
  const changes: CompanionStaticUpgradeResult<Config, undefined> = {
    updatedConfig: null,
    updatedSecrets: null,
    updatedActions: [],
    updatedFeedbacks: [],
  }

	for (const action of props.actions) {
		if (action.actionId === 'sendWebhookMessage') {
			action.options.embed1Fields = { isExpression: false, value: action.options.embed1Fields?.value == false ? 0 : 26 }
			changes.updatedActions.push(action)
		}
	}

	return changes
}*/

export const getUpgrades: CompanionStaticUpgradeScript<Config>[] = [upgradeV1_5_0]
