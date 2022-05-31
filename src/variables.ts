import DiscordInstance from './'

interface InstanceVariableDefinition {
	label: string
	name: string
	type?: string
}

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
		this.instance.setVariables(newVariables)
	}

	/**
	 * @description Sets variable definitions
	 */
	public readonly updateDefinitions = (): void => {
		const variables: Set<InstanceVariableDefinition> = new Set([])

		variables.add({ label: 'Voice Connection Status', name: 'voice_connection_status' })
		variables.add({ label: 'Voice Connection Hostname', name: 'voice_connection_hostname' })
		variables.add({ label: 'Voice Connection Ping', name: 'voice_connection_ping' })
		variables.add({ label: 'Voice Connection Ping Avg', name: 'voice_connection_ping_avg' })
		variables.add({ label: 'Voice Connection Ping Min', name: 'voice_connection_ping_min' })
		variables.add({ label: 'Voice Connection Ping Max', name: 'voice_connection_ping_max' })

		variables.add({ label: 'Voice Self Input Volume', name: 'voice_self_input_volume' })
		variables.add({ label: 'Voice Self Output Volume', name: 'voice_self_output_volume' })

		for (let i = 0; i < this.instance.client.sortedVoiceUsers().length; i++) {
			variables.add({ label: `Voice User ${i} Nick`, name: `voice_user_${i}_nick` })
		}

		variables.add({ label: 'Voice User Selected ID', name: 'voice_user_selected_id' })
		variables.add({ label: 'Voice User Selected Nick', name: 'voice_user_selected_nick' })
		variables.add({ label: 'Voice User Selected Volume', name: 'voice_user_selected_volume' })

		this.instance.setVariableDefinitions([...variables])
	}

	/**
	 * @description Update variables
	 */
	public readonly updateVariables = (): void => {
		const newVariables: InstanceVariableValue = {}

		newVariables.voice_connection_status = this.instance.client.voiceStatus.state
		newVariables.voice_connection_hostname = this.instance.client.voiceStatus.hostname || ''
		newVariables.voice_connection_ping = this.instance.client.voiceStatus.last_ping || ''
		newVariables.voice_connection_ping_avg = this.instance.client.voiceStatus.last_ping || ''
		newVariables.voice_connection_ping_min =
			this.instance.client.voiceStatus.pings.length > 0
				? Math.min(...this.instance.client.voiceStatus.pings.map((ping) => ping.value))
				: ''
		newVariables.voice_connection_ping_max =
			this.instance.client.voiceStatus.pings.length > 0
				? Math.max(...this.instance.client.voiceStatus.pings.map((ping) => ping.value))
				: ''

		newVariables.voice_self_input_volume = this.instance.client.userVoiceSettings?.input.volume.toFixed(2)
		newVariables.voice_self_output_volume = this.instance.client.userVoiceSettings?.output.volume.toFixed(2)

		for (let i = 0; i < 200; i++) {
			newVariables[`voice_user_${i}_nick`] = this.instance.client.sortedVoiceUsers()[i]?.nick || ''
		}

		newVariables.voice_user_selected_id = this.instance.client.selectedUser
		const selectedUser = this.instance.client
			.sortedVoiceUsers()
			.find((voiceState) => voiceState.user.id === this.instance.client.selectedUser)
		newVariables.voice_user_selected_nick = selectedUser?.nick || ''
		newVariables.voice_user_selected_volume = selectedUser?.volume.toFixed(2) || ''

		this.set(newVariables)
		this.updateDefinitions()
	}
}
