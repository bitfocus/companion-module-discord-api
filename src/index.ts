import instance_skel = require('../../../instance_skel')
import {
	CompanionActions,
	CompanionConfigField,
	CompanionFeedbacks,
	CompanionSystem,
	CompanionPreset,
	CompanionStaticUpgradeScript,
} from '../../../instance_skel_types'
import { getActions } from './actions'
import { Config, getConfigFields } from './config'
import { getFeedbacks } from './feedback'
import { getPresets } from './presets'
import { getUpgrades } from './upgrade'
import { Variables } from './variables'
import RPCClient from './client'

/**
 * Companion instance class for Discord's API
 */
class DiscordInstance extends instance_skel<Config> {
	constructor(system: CompanionSystem, id: string, config: Config) {
		super(system, id, config)
		this.config = config
		this.variables = new Variables(this)
	}

	public client = new RPCClient(this)

	public readonly variables

	static GetUpgradeScripts(): CompanionStaticUpgradeScript[] {
		return getUpgrades()
	}

	/**
	 * @description triggered on instance being enabled
	 */
	public init(): void {
		this.updateInstance()

		this.clientInit()
	}

	/**
	 * @description starts connection to Discord
	 */
	private readonly clientInit = (): void => {
		if (!this.config.clientID || !this.config.clientSecret) {
			this.log('info', 'Please configure the Discord module with a Client ID and Client Secret')
			return
		}

		this.client.init().catch((e) => {
			this.log('warn', e.message)
		})
	}

	/**
	 * @description close connections and stop timers/intervals
	 */
	public readonly destroy = (): void => {
		this.client.destroy()
		this.log('debug', `Instance destroyed: ${this.id}`)
	}

	/**
	 * @returns config options
	 * @description generates the config options available for this instance
	 */
	public readonly config_fields = (): CompanionConfigField[] => {
		return getConfigFields()
	}

	/**
	 * @param config new configuration data
	 * @description triggered every time the config for this instance is saved
	 */
	public async updateConfig(config: Config): Promise<void> {
		if (this.config.clientID !== config.clientID || this.config.clientSecret !== config.clientSecret) {
			this.config = config
			this.clientInit()
		} else {
			this.config = config
		}

		this.updateInstance()
	}

	/**
	 * @description sets channels, token, actions, and feedbacks available for this instance
	 */
	public async updateInstance(): Promise<void> {
		// Cast actions and feedbacks from Discord types to Companion types
		const actions = getActions(this) as CompanionActions
		const feedbacks = getFeedbacks(this) as CompanionFeedbacks

		this.setActions(actions)
		this.setFeedbackDefinitions(feedbacks)
		this.setPresetDefinitions(getPresets(this) as CompanionPreset[])
		this.variables.updateVariables()
	}
}

export = DiscordInstance
