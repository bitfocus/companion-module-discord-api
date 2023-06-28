import DiscordInstance from './'
import { CompanionVariableDefinition } from '@companion-module/base'

interface InstanceVariableValue {
	[key: string]: string | number | undefined
}

export class Variables {
	private readonly instance: DiscordInstance
	//private currentVariables: InstanceVariableValue = {}

	constructor(instance: DiscordInstance) {
		this.instance = instance
	}

	/**
	 * @param variables Object of variablenames and their values
	 * @description Updates or removes variable for current instance
	 */
	public readonly set = (variables: InstanceVariableValue): void => {
		const newVariables: { [variableId: string]: string | undefined } = {}

		for (const name in variables) {
			newVariables[name] = variables[name]?.toString()
		}

		//this.currentVariables = variables
		this.instance.setVariableValues(newVariables)
	}

	/**
	 * @description Sets variable definitions
	 */
	public readonly updateDefinitions = (): void => {
		const variables: Set<CompanionVariableDefinition> = new Set([])

		variables.add({ name: 'Voice Connection Status', variableId: 'voice_connection_status' })
		variables.add({ name: 'Voice Connection Hostname', variableId: 'voice_connection_hostname' })
		variables.add({ name: 'Voice Connection Ping', variableId: 'voice_connection_ping' })
		variables.add({ name: 'Voice Connection Ping Avg', variableId: 'voice_connection_ping_avg' })
		variables.add({ name: 'Voice Connection Ping Min', variableId: 'voice_connection_ping_min' })
		variables.add({ name: 'Voice Connection Ping Max', variableId: 'voice_connection_ping_max' })

		variables.add({ name: 'Voice Self Input Volume', variableId: 'voice_self_input_volume' })
		variables.add({ name: 'Voice Self Output Volume', variableId: 'voice_self_output_volume' })

		for (let i = 0; i < this.instance.clientData?.sortedVoiceUsers().length || 0; i++) {
			variables.add({ name: `Voice User ${i} Nick`, variableId: `voice_user_${i}_nick` })
		}

		variables.add({ name: 'Voice User Selected ID', variableId: 'voice_user_selected_id' })
		variables.add({ name: 'Voice User Selected Nick', variableId: 'voice_user_selected_nick' })
		variables.add({ name: 'Voice User Selected Volume', variableId: 'voice_user_selected_volume' })

		this.instance.setVariableDefinitions([...variables])
	}

	/**
	 * @description Update variables
	 */
	public readonly updateVariables = (): void => {
		const newVariables: InstanceVariableValue = {}

		if (this.instance.clientData) {
			newVariables.voice_connection_status = this.instance.clientData.voiceStatus.state
			newVariables.voice_connection_hostname = this.instance.clientData.voiceStatus.hostname || ''
			newVariables.voice_connection_ping = this.instance.clientData.voiceStatus.last_ping || ''
			newVariables.voice_connection_ping_avg = this.instance.clientData.voiceStatus.last_ping || ''
			newVariables.voice_connection_ping_min =
				this.instance.clientData.voiceStatus.pings.length > 0
					? Math.min(...this.instance.clientData.voiceStatus.pings.map((ping: any) => ping.value))
					: ''
			newVariables.voice_connection_ping_max =
				this.instance.clientData.voiceStatus.pings.length > 0
					? Math.max(...this.instance.clientData.voiceStatus.pings.map((ping: any) => ping.value))
					: ''

			newVariables.voice_self_input_volume = this.instance.clientData.userVoiceSettings?.input.volume.toFixed(2)
			newVariables.voice_self_output_volume = this.instance.clientData.userVoiceSettings?.output.volume.toFixed(2)

			for (let i = 0; i < 200; i++) {
				newVariables[`voice_user_${i}_nick`] = this.instance.clientData?.sortedVoiceUsers()[i]?.nick || ''
			}

			newVariables.voice_user_selected_id = this.instance.clientData.selectedUser

			const selectedUser = this.instance.clientData
				.sortedVoiceUsers()
				.find((voiceState: any) => voiceState.user.id === this.instance.clientData.selectedUser)
			newVariables.voice_user_selected_nick = selectedUser?.nick || ''
			newVariables.voice_user_selected_volume = selectedUser?.volume.toFixed(2) || ''
		}

		this.set(newVariables)
		this.updateDefinitions()
	}
}
