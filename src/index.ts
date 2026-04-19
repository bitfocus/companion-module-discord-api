import { InstanceBase, CompanionHTTPRequest, CompanionHTTPResponse, SomeCompanionConfigField, createModuleLogger } from '@companion-module/base'
import { DiscordActions, getActions } from './actions.js'
import { Discord } from './client.js'
import { Config, getConfigFields } from './config.js'
import { DiscordFeedbacks, getFeedbacks } from './feedback.js'
import { httpHandler } from './http.js'
import { getPresets } from './presets.js'
import { getUpgrades } from './upgrade.js'
import { Variables, VariableValue } from './variables.js'

export type Manifest = {
	config: Config
	feedbacks: DiscordFeedbacks
	actions: DiscordActions
	variables: VariableValue
	secrets: undefined
}

/**
 * Companion instance class for Discord's API
 */
export default class DiscordInstance extends InstanceBase<Manifest> {
	constructor(internal: unknown) {
		super(internal)
		this.instanceOptions.disableVariableValidation = true
	}

	public discord: Discord = new Discord(this)
	public logger = createModuleLogger('Discord')

	public config: Config = {
		clientID: '',
		clientSecret: '',
		refreshToken: '',
		speakerDelay: 100,
		clearOAuth: false,
	}

	public readonly variables = new Variables(this)

	/**
	 * @description triggered on instance being enabled
	 */
	public async init(config: Config): Promise<void> {
		this.logger.debug(`Process ID: ${process.pid}`)
		await this.configUpdated(config)
		await this.updateInstance()
		this.setPresetDefinitions(...getPresets())
		this.clientInit()
	}

	/**
	 * @description starts connection to Discord
	 */
	private readonly clientInit = (): void => {
		if (!this.config.clientID || !this.config.clientSecret) {
			this.logger.info('Please configure the Discord module with a Client ID and Client Secret')
			return
		}

		this.discord.init()
	}

	/**
	 * @description close connections and stop timers/intervals
	 */
	public async destroy(): Promise<void> {
		if (this.discord.data.delayedSpeakingTimers) {
			Object.values(this.discord.data.delayedSpeakingTimers).forEach((timer: any) => {
				clearTimeout(timer)
			})
		}

		this.discord.client.destroy()
		this.logger.debug(`Instance destroyed: ${this.id}`)
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
		if (config.clearOAuth) {
			this.saveConfig({ ...config, clearOAuth: false, accessToken: '', refreshToken: '' })
		} else if (this.config.clientID !== config.clientID || this.config.clientSecret !== config.clientSecret) {
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
		const feedbacks = getFeedbacks(this)

		this.setActionDefinitions(actions)
		this.setFeedbackDefinitions(feedbacks)
		this.checkAllFeedbacks()
		this.variables.updateVariables()
	}

	/**
	 * @param request HTTP request from Companion
	 * @returns HTTP response
	 */
	public async handleHttpRequest(request: CompanionHTTPRequest): Promise<CompanionHTTPResponse> {
		return httpHandler(this, request)
	}
}

export const UpgradeScripts = getUpgrades()
