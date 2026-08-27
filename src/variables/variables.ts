import DiscordInstance from '../index.js'
import type { CompanionVariableDefinitions, JsonValue } from '@companion-module/base'
import { type VideoVariablesSchema, videoDefinitions, videoValues } from './videoVariables.js'
import { type VoiceVariablesSchema, voiceDefinitions, voiceValues } from './voiceVariables.js'

export interface InstanceVariableValue {
	[key: string]: string | number | JsonValue | undefined
}

export type VariablesSchema = VideoVariablesSchema & VoiceVariablesSchema

export class Variables {
	private readonly instance: DiscordInstance
	public currentDefinitions: CompanionVariableDefinitions = {}
	public currentVariables: Partial<VariablesSchema> = {}
	public definitionsUpdateDebounce: ReturnType<typeof setTimeout> | null = null
	public definitionsUpdateNeeded = false

	constructor(instance: DiscordInstance) {
		this.instance = instance
	}

	/**
	 * @param variables Object of variable names and their values
	 * @description Updates or removes variable for current instance
	 */
	public readonly set = (variables: Partial<VariablesSchema>): void => {
		this.currentVariables = variables
		this.instance.setVariableValues(variables)
	}

	/**
	 * @description Sets variable definitions
	 */
	public readonly updateDefinitions = async (): Promise<void> => {
		if (this.definitionsUpdateDebounce !== null) {
			this.definitionsUpdateNeeded = true
			return
		}

		this.definitionsUpdateDebounce = setTimeout(() => {
			this.definitionsUpdateDebounce = null
			if (this.definitionsUpdateNeeded) {
				this.definitionsUpdateNeeded = false
				this.updateDefinitions()
			}
		}, 100)

		const variableDefinitions: CompanionVariableDefinitions<VariablesSchema> = {
			...videoDefinitions(this.instance),
			...voiceDefinitions(this.instance),
		}

		if (JSON.stringify(this.currentDefinitions) !== JSON.stringify(variableDefinitions)) this.instance.setVariableDefinitions(variableDefinitions)
		this.currentDefinitions = variableDefinitions
	}

	public readonly updateVariables = async (): Promise<void> => {
		let newVariables: Partial<VariablesSchema> = {}
		const variablesPromise = await Promise.all([videoValues(this.instance), voiceValues(this.instance)])

		variablesPromise.forEach((variables: Partial<VariablesSchema>) => {
			newVariables = { ...newVariables, ...variables }
		})

		this.set(newVariables)
		this.updateDefinitions()
	}
}
