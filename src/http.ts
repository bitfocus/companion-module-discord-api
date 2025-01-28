import { CompanionHTTPRequest, CompanionHTTPResponse } from '@companion-module/base'
import DiscordInstance from './index'

interface Endpoints {
	GET: {
		debug: () => Promise<void>

		[endpoint: string]: () => Promise<void> | void
	}

	[method: string]: {
		[endpoint: string]: () => void
	}
}

/**
 * @returns HTTP Request
 * @description Creates a basic HTTP request to be used internally to call the HTTP handler functions
 */
export const defaultHTTPRequest = (): CompanionHTTPRequest => {
	return { method: 'GET', path: '', headers: {}, baseUrl: '', hostname: '', ip: '', originalUrl: '', query: {} }
}

/**
 * @param instance GoogleSheets Instance
 * @param request HTTP request
 * @returns HTTP response
 * @description Checks incoming HTTP requests to the instance for an appropriate handler or returns a 404
 */
export const httpHandler = async (instance: DiscordInstance, request: CompanionHTTPRequest): Promise<CompanionHTTPResponse> => {
	const response: CompanionHTTPResponse = {
		status: 404,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ status: 404, message: 'Not Found' }),
	}

	const debug = async () => {
		const type = request.query.type

		if (type === 'resetVoice') {
			await instance.discord.clearVoiceSubscriptions()
			await instance.discord.createVoiceSusbcriptions()

			instance.variables.updateVariables()
			instance.checkFeedbacks()
			response.status = 200
			response.body = ''
		} else if (type === 'sortedVoiceUsers') {
			const data = instance.discord.sortedVoiceUsers()
			response.status = 200
			response.body = JSON.stringify(data, null, 2)
		} else if (type === 'getSelectedVoiceChannel') {
			const data = await instance.discord.client.getSelectedVoiceChannel()
			response.status = 200
			response.body = JSON.stringify(data, null, 2)
		}
	}

	const endpoints: Endpoints = {
		GET: {
			debug,
		},
	}

	const endpoint = request.path.replace('/', '').toLowerCase()

	if (endpoints[request.method][endpoint]) {
		if (endpoint === 'debug') await debug()
	}

	return response
}
