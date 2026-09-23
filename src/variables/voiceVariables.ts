import type { CompanionVariableDefinitions } from '@companion-module/base'
import type DiscordInstance from '../index.js'

export type VoiceVariablesSchema = {
	voice_connection_status: string
	voice_connection_hostname: string
	voice_connection_ping: number | ''
	voice_connection_ping_avg: number | ''
	voice_connection_ping_min: number | ''
	voice_connection_ping_max: number | ''
	voice_self_input_mode: string
	voice_self_input_volume: string
	voice_self_mic_active: boolean
	voice_self_output_volume: string
	[key: `voice_user_${number}_nick`]: string
	[key: `voice_user_${string}_nick`]: string
	[key: `voice_user_${string}_volume`]: number | string
	[key: `voice_user_${string}_mute`]: boolean
	[key: `voice_user_${string}_deaf`]: boolean
	[key: `voice_user_${string}_self_mute`]: boolean
	[key: `voice_user_${string}_self_deaf`]: boolean
	[key: `voice_user_${string}_speaking`]: boolean
	[key: `voice_user_${string}_avatar`]: string
	voice_current_speaker_id: string
	voice_current_speaker_nick: string
	voice_current_speaker_number: number | string
	voice_current_speaker_avatar: string
	voice_user_selected_id: string
	voice_user_selected_nick: string
	voice_user_selected_volume: number | string
	voice_user_selected_avatar: string
}

export const voiceDefinitions = (instance: DiscordInstance): CompanionVariableDefinitions<VoiceVariablesSchema> => {
	const definitions: CompanionVariableDefinitions<VoiceVariablesSchema> = {
		voice_connection_status: { name: 'Voice Connection Status' },
		voice_connection_hostname: { name: 'Voice Connection Hostname' },
		voice_connection_ping: { name: 'Voice Connection Ping' },
		voice_connection_ping_avg: { name: 'Voice Connection Ping Avg' },
		voice_connection_ping_min: { name: 'Voice Connection Ping Min' },
		voice_connection_ping_max: { name: 'Voice Connection Ping Max' },
		voice_self_input_mode: { name: 'Voice Self Input Mode' },
		voice_self_input_volume: { name: 'Voice Self Input Volume' },
		voice_self_mic_active: { name: 'Voice Self Mic Active' },
		voice_self_output_volume: { name: 'Voice Self Output Volume' },
		voice_current_speaker_id: { name: 'Voice Current Speaker ID' },
		voice_current_speaker_nick: { name: 'Voice Current Speaker Nick' },
		voice_current_speaker_number: { name: 'Voice Current Speaker Number' },
		voice_current_speaker_avatar: { name: 'Voice Current Speaker Avatar' },
		voice_user_selected_id: { name: 'Voice User Selected ID' },
		voice_user_selected_nick: { name: 'Voice User Selected Nick' },
		voice_user_selected_volume: { name: 'Voice User Selected Volume' },
		voice_user_selected_avatar: { name: 'Voice User Selected Avatar' },
	}

	const voiceUsers: any[] = instance.discord.sortedVoiceUsers() || []

	voiceUsers.forEach((voiceState, index) => {
		definitions[`voice_user_${index}_nick`] = { name: `Voice User ${index} Nick` }
		definitions[`voice_user_${voiceState.user.id}_nick`] = { name: `Voice User ${voiceState.user.id} Nick` }

		const ids = [index, voiceState.nick, voiceState.user.id]
		ids.forEach((id) => {
			id = id + ''
			const safeID = id.replace(/[^a-z0-9-_.]+/gi, '')
			definitions[`voice_user_${safeID}_volume`] = { name: `Voice User ${id} Volume` }
			definitions[`voice_user_${safeID}_mute`] = { name: `Voice User ${id} Mute` }
			definitions[`voice_user_${safeID}_deaf`] = { name: `Voice User ${id} Deaf` }
			definitions[`voice_user_${safeID}_self_mute`] = { name: `Voice User ${id} Self Mute` }
			definitions[`voice_user_${safeID}_self_deaf`] = { name: `Voice User ${id} Self Deaf` }
			definitions[`voice_user_${safeID}_speaking`] = { name: `Voice User ${id} Speaking` }
			definitions[`voice_user_${safeID}_avatar`] = { name: `Voice User ${id} Avatar` }
		})
	})

	return definitions
}

export const voiceValues = async (instance: DiscordInstance): Promise<VoiceVariablesSchema> => {
	const variables: VoiceVariablesSchema = {
		voice_connection_status: instance.discord.data.voiceStatus.state,
		voice_connection_hostname: instance.discord.data.voiceStatus.hostname || '',
		voice_connection_ping: instance.discord.data.voiceStatus.last_ping || '',
		voice_connection_ping_avg: instance.discord.data.voiceStatus.last_ping || '',
		voice_connection_ping_min: instance.discord.data.voiceStatus.pings.length > 0 ? Math.min(...instance.discord.data.voiceStatus.pings.map((ping: any) => ping.value)) : '',
		voice_connection_ping_max: instance.discord.data.voiceStatus.pings.length > 0 ? Math.max(...instance.discord.data.voiceStatus.pings.map((ping: any) => ping.value)) : '',
		voice_self_input_mode: instance.discord.data.userVoiceSettings?.mode.type || '',
		voice_self_input_volume: instance.discord.data.userVoiceSettings?.input.volume.toFixed(2) || '',
		voice_self_mic_active: instance.discord.data.speaking.has(instance.discord.client.user?.id),
		voice_self_output_volume: instance.discord.data.userVoiceSettings?.output.volume.toFixed(2) || '',
		voice_current_speaker_id: '',
		voice_current_speaker_nick: '',
		voice_current_speaker_number: '',
		voice_current_speaker_avatar: '',
		voice_user_selected_id: instance.discord.data.selectedUser || '',
		voice_user_selected_nick: '',
		voice_user_selected_volume: '',
		voice_user_selected_avatar: '',
	}

	if (instance.discord.data) {
		for (let i = 0; i < 200; i++) {
			variables[`voice_user_${i}_nick`] = ''
			variables[`voice_user_${i}_volume`] = ''
			variables[`voice_user_${i}_mute`] = false
			variables[`voice_user_${i}_deaf`] = false
			variables[`voice_user_${i}_self_mute`] = false
			variables[`voice_user_${i}_self_deaf`] = false
			variables[`voice_user_${i}_speaking`] = false
			variables[`voice_user_${i}_avatar`] = ''
		}

		const voiceUsers = instance.discord.sortedVoiceUsers() || []

		voiceUsers.forEach((voiceState, index) => {
			variables[`voice_user_${index}_nick`] = voiceState.nick
			variables[`voice_user_${voiceState.user.id}_nick`] = voiceState.nick

			const ids = [index, voiceState.nick, voiceState.user.id]
			ids.forEach((id) => {
				const safeId = (id + '').replace(/[^a-z0-9-_.]+/gi, '')
				variables[`voice_user_${safeId}_volume`] = voiceState.volume || ''
				variables[`voice_user_${safeId}_mute`] = voiceState.mute
				variables[`voice_user_${safeId}_deaf`] = voiceState.voice_state.deaf
				variables[`voice_user_${safeId}_self_mute`] = voiceState.voice_state.self_mute
				variables[`voice_user_${safeId}_self_deaf`] = voiceState.voice_state.self_deaf
				variables[`voice_user_${safeId}_speaking`] = instance?.discord.data?.delayedSpeaking.has(voiceState.user.id)
				variables[`voice_user_${safeId}_avatar`] = voiceState.avatar || ''
			})
		})

		const currentSpeaker = Array.from(instance?.discord.data?.delayedSpeaking || []).pop()

		if (typeof currentSpeaker === 'string') {
			const user = instance.discord.sortedVoiceUsers().find((voiceState: any) => voiceState.user.id === currentSpeaker)
			const userIndex = instance.discord.sortedVoiceUsers().findIndex((voiceState: any) => voiceState.user.id === currentSpeaker)

			variables.voice_current_speaker_id = currentSpeaker || ''
			variables.voice_current_speaker_nick = user?.nick || ''
			variables.voice_current_speaker_number = userIndex || ''
			variables.voice_current_speaker_avatar = user?.avatar || ''
		}

		const selectedUser = instance.discord.sortedVoiceUsers().find((voiceState: any) => voiceState.user.id === instance.discord.data.selectedUser)
		variables.voice_user_selected_nick = selectedUser?.nick || ''
		variables.voice_user_selected_volume = selectedUser?.volume.toFixed(2) || ''
		variables.voice_user_selected_avatar = selectedUser?.avatar || ''
	}

	return variables
}
