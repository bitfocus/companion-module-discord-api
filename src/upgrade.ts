import { CompanionStaticUpgradeResult, CompanionStaticUpgradeScript } from '@companion-module/base'
import { Config } from './config'

const upgradeV1_5_0: CompanionStaticUpgradeScript<Config> = (_context, props): CompanionStaticUpgradeResult<Config> => {
  const actions: any = props.actions
  const changes: CompanionStaticUpgradeResult<Config> = {
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


export const getUpgrades = (): CompanionStaticUpgradeScript<Config>[] => {
	return [upgradeV1_5_0]
}
