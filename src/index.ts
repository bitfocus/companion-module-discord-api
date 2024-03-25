import {
	InstanceBase,
	runEntrypoint,
	CompanionFeedbackDefinitions,
	SomeCompanionConfigField,
} from '@companion-module/base'
import { getActions } from './actions'
import { discordInit } from './client'
import { Config, getConfigFields } from './config'
import { getFeedbacks } from './feedback'
import { getPresets } from './presets'
import { getUpgrades } from './upgrade'
import { Variables } from './variables'
//import RPCClient from './client'

/**
 * Companion instance class for Discord's API
 */
class DiscordInstance extends InstanceBase<Config> {
	constructor(internal: unknown) {
		super(internal)
		this.instanceOptions.disableVariableValidation = true
	}

	public client: any
	public clientData: any

	public config: Config = {
		clientID: '',
		clientSecret: '',
		refreshToken: '',
		speakerDelay: 100,
	}

	public readonly variables = new Variables(this)

	/**
	 * @description triggered on instance being enabled
	 */
	public async init(config: Config): Promise<void> {
    this.log('debug', `Process ID: ${process.pid}`)
		await this.configUpdated(config)
		this.updateInstance()
		this.setPresetDefinitions(getPresets())
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

		discordInit(this)
	}

	/**
	 * @description close connections and stop timers/intervals
	 */
	public async destroy(): Promise<void> {
		if (this.clientData?.delayedSpeakingTimers) {
			Object.values(this.clientData.delayedSpeakingTimers).forEach((timer: any) => {
				clearTimeout(timer)
			})
		}
		this.log('debug', `Instance destroyed: ${this.id}`)
	}

	/**
	 * @returns config options
	 * @description generates the config options available for this instance
	 */
	public getConfigFields(): SomeCompanionConfigField[] {
		return getConfigFields()
	}

	/**
	 * @param config new configuration data
	 * @description triggered every time the config for this instance is saved
	 */
	public async configUpdated(config: Config): Promise<void> {
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
		const actions = getActions(this)
		const feedbacks = getFeedbacks(this) as unknown as CompanionFeedbackDefinitions

		this.setActionDefinitions(actions)
		this.setFeedbackDefinitions(feedbacks)
		this.variables.updateVariables()
	}
}

export = DiscordInstance

runEntrypoint(DiscordInstance, getUpgrades())
