import { InstanceBase, type CompanionHTTPRequest, type CompanionHTTPResponse, type SomeCompanionConfigField } from '@companion-module/base'
import { type ActionsSchema, getActions } from './actions/actions.js'
import { Discord } from './client.js'
import { type Config, getConfigFields } from './config.js'
import { type FeedbacksSchema, getFeedbacks } from './feedbacks/feedback.js'
import { httpHandler } from './http.js'
import { getPresetDefinitions, getPresetStructure } from './presets/presets.js'
import { getUpgrades } from './upgrade.js'
import { Variables, type VariablesSchema } from './variables/variables.js'

export interface InstanceTypes {
	config: Config
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export default class DiscordInstance extends InstanceBase<InstanceTypes> {
	constructor(internal: unknown) {
		super(internal)
		this.instanceOptions.disableVariableValidation = true
	}

	public discord: Discord = new Discord(this)

	public config: Config = {
		accessToken: '',
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
		await this.configUpdated(config)
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
		if (config.clearOAuth) {
			this.saveConfig({ ...config, clearOAuth: false, accessToken: '', refreshToken: '' })
		} else if (this.config.clientID !== config.clientID || this.config.clientSecret !== config.clientSecret || this.config.accessToken !== config.accessToken) {
			this.config = config
			this.clientInit()
		} else {
			this.config = config
		}

		this.updateInstance()
	}

	public async updatePresets(): Promise<void> {
		const presetStructure = await getPresetStructure(this)
		const presetDefinitions = getPresetDefinitions(this)
		this.setPresetDefinitions(presetStructure, presetDefinitions)
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
		await this.updatePresets()
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

export const UpgradeScripts = getUpgrades
