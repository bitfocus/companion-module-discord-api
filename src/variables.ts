import DiscordInstance from './'
import { CompanionVariableDefinition } from '@companion-module/base'
import { VoiceState } from './client'

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

		const voiceUsers: any[] = this.instance.clientData?.sortedVoiceUsers()
		voiceUsers.forEach((voiceState, index) => {
			variables.add({ name: `Voice User ${index} Nick`, variableId: `voice_user_${index}_nick` })
			variables.add({
				name: `Voice User ${voiceState.user.id} Nick`,
				variableId: `voice_user_${voiceState.user.id}_nick`,
			})
			;[index, voiceState.nick, voiceState.user.id].forEach((id) => {
				variables.add({ name: `Voice User ${id} Volume`, variableId: `voice_user_${id}_volume` })
				variables.add({ name: `Voice User ${id} Mute`, variableId: `voice_user_${id}_mute` })
				variables.add({ name: `Voice User ${id} Deaf`, variableId: `voice_user_${id}_deaf` })
				variables.add({ name: `Voice User ${id} Self Mute`, variableId: `voice_user_${id}_self_mute` })
				variables.add({ name: `Voice User ${id} Self Deaf`, variableId: `voice_user_${id}_self_deaf` })
				variables.add({ name: `Voice User ${id} Speaking`, variableId: `voice_user_${id}_speaking` })
			})
		})

		variables.add({ name: 'Voice Current Speaker ID', variableId: 'voice_current_speaker_id' })
		variables.add({ name: 'Voice Current Speaker Nick', variableId: 'voice_current_speaker_nick' })
		variables.add({ name: 'Voice Current Speaker Number', variableId: 'voice_current_speaker_number' })

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
			const voiceUsers: VoiceState[] = this.instance.clientData?.sortedVoiceUsers()
			voiceUsers.forEach((voiceState, index) => {
				newVariables[`voice_user_${index}_nick`] = voiceState.nick
				newVariables[`voice_user_${voiceState.user.id}_nick`] = voiceState.nick
				;[index, voiceState.nick, voiceState.user.id].forEach((id) => {
					newVariables[`voice_user_${id}_volume`] = voiceState.volume || ''
					newVariables[`voice_user_${id}_mute`] = voiceState.mute.toString() || 'false'
					newVariables[`voice_user_${id}_deaf`] = voiceState.voice_state.deaf.toString() || 'false'
					newVariables[`voice_user_${id}_self_mute`] = voiceState.voice_state.self_mute.toString() || 'false'
					newVariables[`voice_user_${id}_self_deaf`] = voiceState.voice_state.self_deaf.toString() || 'false'
					newVariables[`voice_user_${id}_speaking`] = this.instance?.clientData?.delayedSpeaking
						.has(voiceState.user.id)
						.toString()
				})
			})

			newVariables.voice_current_speaker_id = ''
			newVariables.voice_current_speaker_nick = ''
			newVariables.voice_current_speaker_number = ''

			const currentSpeaker = Array.from(this.instance?.clientData?.delayedSpeaking || []).pop()
			if (typeof currentSpeaker === 'string') {
				const user = this.instance.clientData
					.sortedVoiceUsers()
					.find((voiceState: any) => voiceState.user.id === currentSpeaker)
				const userIndex = this.instance.clientData
					.sortedVoiceUsers()
					.findIndex((voiceState: any) => voiceState.user.id === currentSpeaker)

				newVariables.voice_current_speaker_id = currentSpeaker
				newVariables.voice_current_speaker_nick = user.nick
				newVariables.voice_current_speaker_number = userIndex
			}

			newVariables.voice_user_selected_nick = ''
			newVariables.voice_user_selected_volume = ''
			newVariables.voice_user_selected_id = this.instance.clientData.selectedUser || ''

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
