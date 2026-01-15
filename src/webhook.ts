import type { CompanionActionContext } from '@companion-module/base'
import type { InputFieldWithDefault, SendWebhookMessageCallback } from './actions'
import type DiscordInstance from './index'

type WebhookBody = {
	username: string
	avatar_url?: string
	content?: string
	embeds: WebhookEmbed[]
	poll?: WebhookPoll
	tts: boolean
	allowed_mentions?: {
		parse?: string[]
		roles?: string[]
		users?: string[]
	}
}

type WebhookEmbed = {
	color: number
	author?: {
		name: string
		url?: string
		icon_url?: string
	}
	title?: string
	url?: string
	description?: string
	fields: WebhookEmbedField[]
	thumbnail?: {
		url: string
	}
	image?: {
		url: string
	}
	footer?: {
		text: string
		icon_url?: string
	}
	timestamp?: string
}

type WebhookEmbedField = {
	name: string
	value: string
	inline: boolean
}

type WebhookPoll = {
	question: {
		text: string
	}
	answers: WebhookPollAnswers[]
	duration?: number
	allow_multiselect: boolean
}

type WebhookPollAnswers = {
	poll_media: {
		text: string
		emoji?: {
			id: string
			name: string
		}
	}
}

export const generateWebhookOptions = (): InputFieldWithDefault[] => {
	const embed: InputFieldWithDefault[] = [
		{
			type: 'checkbox',
			label: 'Embed',
			tooltip: 'Enable to show Embed related options',
			id: 'embed',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'colorpicker',
			label: 'Embed Color',
			id: 'embed1Color',
			default: 0,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Author Name',
			id: 'embed1AuthorName',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Author URL',
			id: 'embed1AuthorURL',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true && $(options:embed1AuthorName) !== ''`,
		},
		{
			type: 'textinput',
			label: 'Author Icon URL',
			id: 'embed1AuthorIconURL',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true && $(options:embed1AuthorName) !== ''`,
		},
		{
			type: 'textinput',
			label: 'Title',
			id: 'embed1Title',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Title URL',
			id: 'embed1URL',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true && $(options:embed1Title) !== ''`,
		},
		{
			type: 'textinput',
			label: 'Description',
			id: 'embed1Description',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'checkbox',
			label: 'Fields',
			tooltip: 'Enable to show Embed Field options',
			id: 'embed1Fields',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
	]

	for (let i = 1; i < 26; i++) {
		let visibility = `!$(options:useCustomBody) && $(options:embed) === true && $(options:embed1Fields) === true`

		if (i > 1) {
			for (let j = 1; j < i; j++) {
				visibility += ` && $(options:embed1Field${j}Name) !== ''`
			}
		}

		embed.push(
			{
				type: 'textinput',
				label: `Field ${i} Name`,
				id: `embed1Field${i}Name`,
				default: '',
				isVisibleExpression: visibility,
				useVariables: { local: true },
			},
			{
				type: 'textinput',
				label: `Field ${i} Value`,
				id: `embed1Field${i}Value`,
				default: '',
				isVisibleExpression: visibility,
				useVariables: { local: true },
			},
			{
				type: 'checkbox',
				label: `Field ${i} Inline`,
				id: `embed1Field${i}Inline`,
				default: false,
				isVisibleExpression: visibility,
			},
		)
	}

	embed.push(
		{
			type: 'textinput',
			label: 'Embed Thumbnail URL',
			id: 'embed1ThumbnailURL',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Embed Image URL',
			id: 'embed1ImageURL',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Embed Footer Text',
			id: 'embed1Footer',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Embed Footer Icon URL',
			id: 'embed1FooterIconURL',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Embed Timestamp (2025-12-31T12:00:00.000Z format)',
			id: 'embed1Timestamp',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
	)

	const poll: InputFieldWithDefault[] = [
		{
			type: 'checkbox',
			label: 'Poll',
			tooltip: 'Enable to show Poll related options',
			id: 'poll',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Poll Question',
			id: 'pollQuestion',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:poll) === true`,
			useVariables: { local: true },
		},
	]

	for (let i = 1; i < 11; i++) {
		let visibility = `!$(options:useCustomBody) && $(options:poll) === true`

		if (i > 1) {
			for (let j = 1; j < i; j++) {
				visibility += ` && $(options:pollAnswer${j}) !== ''`
			}
		}

		poll.push({
			type: 'textinput',
			label: `Poll Answer ${i}`,
			id: `pollAnswer${i}`,
			default: '',
			isVisibleExpression: visibility,
			useVariables: { local: true },
		})
	}

	const options: InputFieldWithDefault[] = [
		{
			type: 'textinput',
			label: 'Webhook URL',
			id: 'url',
			default: '',
			useVariables: { local: true },
		},
		{
			type: 'checkbox',
			label: 'Use Custom Webhook Body',
			id: 'useCustomBody',
			default: false,
		},
		{
			type: 'textinput',
			label: 'Custom Webhook Body',
			id: 'customBody',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Username',
			tooltip: 'Leave blank to use Webhook settings',
			id: 'username',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Avatar URL',
			tooltip: 'Leave blank to use Webhook settings',
			id: 'avatarURL',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Content',
			tooltip: 'Up to 2000 characters',
			id: 'content',
			default: '',
			useVariables: { local: true },
			isVisibleExpression: `!$(options:useCustomBody)`,
		},

		...embed,
		...poll,

		{
			type: 'checkbox',
			label: 'TTS',
			tooltip: 'Enable to send the message spoken as with the /tts command',
			id: 'tts',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'checkbox',
			label: 'Allowed Mentions',
			tooltip: 'Control who will be pinged by the message. See https://discord.com/developers/docs/resources/message#allowed-mentions-object',
			id: 'allowedMentions',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Parse',
			tooltip: 'Space separated, not to be used alongside Users, or Roles options',
			id: 'allowedMentionsParse',
			default: 'users',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions) === true`,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Users',
			tooltip: 'Space separated',
			id: 'allowedMentionsUsers',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions) === true`,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Roles',
			tooltip: 'Space separated',
			id: 'allowedMentionsRoles',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions) === true`,
		},
	]

	return options
}

export const webhookAction = async (instance: DiscordInstance, action: SendWebhookMessageCallback, context: CompanionActionContext): Promise<void> => {
	const url = await context.parseVariablesInString(action.options.url as string)
	const webhookBody: WebhookBody = {
		username: '',
		avatar_url: '',
		embeds: [],
		tts: action.options.tts as boolean,
	}

	if (!url) {
		instance.log('warn', 'Invalid Webhook URL')
		return
	}

	if (action.options.username) webhookBody.username = await context.parseVariablesInString(action.options.username as string)
	if (action.options.avatarURL) webhookBody.avatar_url = await context.parseVariablesInString(action.options.avatarURL as string)
	if (action.options.content) webhookBody.content = await context.parseVariablesInString(action.options.content as string)

	if (action.options.embed) {
		const embedOptions: WebhookEmbed = {
			color: action.options[`embed1Color`] as number,
			fields: [],
		}

		if (action.options[`embed1AuthorName`]) {
			embedOptions.author = {
				name: await context.parseVariablesInString(action.options[`embed1AuthorName`] as string),
			}

			if (action.options[`embed1AuthorURL`]) embedOptions.author.url = await context.parseVariablesInString(action.options[`embed1AuthorURL`] as string)
			if (action.options[`embed1AuthorIconURL`]) embedOptions.author.icon_url = await context.parseVariablesInString(action.options[`embed1AuthorIconURL`] as string)
		}

		if (action.options[`embed1Title`]) embedOptions.title = await context.parseVariablesInString(action.options[`embed1Title`] as string)
		if (action.options[`embed1URL`]) embedOptions.url = await context.parseVariablesInString(action.options[`embed1URL`] as string)
		if (action.options[`embed1Description`]) embedOptions.description = await context.parseVariablesInString(action.options[`embed1Description`] as string)

		if (action.options[`embed1Fields`]) {
			let fieldCount = 1
			for (let j = 1; j < 26; j++) {
				if (j === fieldCount && action.options[`embed1Field${j}Name`]) {
					embedOptions.fields.push({
						name: await context.parseVariablesInString(action.options[`embed1Field${j}Name`] as string),
						value: await context.parseVariablesInString(action.options[`embed1Field${j}Value`] as string),
						inline: action.options[`embed1Field${j}Inline`] as boolean,
					})

					fieldCount++
				}
			}
		}

		if (action.options[`embed1ThumbnailURL`]) embedOptions.thumbnail = { url: await context.parseVariablesInString(action.options[`embed1ThumbnailURL`] as string) }
		if (action.options[`embed1ImageURL`]) embedOptions.image = { url: await context.parseVariablesInString(action.options[`embed1ImageURL`] as string) }
		if (action.options[`embed1Footer`]) {
			embedOptions.footer = {
				text: await context.parseVariablesInString(action.options[`embed1Footer`] as string),
				icon_url: await context.parseVariablesInString(action.options[`embed1FooterIconURL`] as string),
			}
		}
		if (action.options[`embed1Timestamp`]) embedOptions.timestamp = await context.parseVariablesInString(action.options[`embed1Timestamp`] as string)

		if (JSON.stringify(embedOptions) !== '{}') webhookBody.embeds.push(embedOptions)
	}

	if (action.options.poll) {
		webhookBody.poll = {
			question: {
				text: await context.parseVariablesInString(action.options.pollQuestion as string),
			},
			answers: [],
			allow_multiselect: action.options.pollMultiSelect as boolean,
		}

		let answers = 1
		for (let i = 1; i < 11; i++) {
			if (i === answers && action.options[`pollAnswer${i}`]) {
				webhookBody.poll.answers.push({ poll_media: { text: await context.parseVariablesInString(action.options[`pollAnswer${i}`] as string) } })
				answers++
			}
		}
	}

	if (action.options.allowedMentions) {
		webhookBody.allowed_mentions = {}
		if (action.options.allowedMentionsParse) webhookBody.allowed_mentions.parse = (await context.parseVariablesInString(action.options.allowedMentionsParse as string)).split(' ')
		if (action.options.allowedMentionsRoles) webhookBody.allowed_mentions.roles = (await context.parseVariablesInString(action.options.allowedMentionsRoles as string)).split(' ')
		if (action.options.allowedMentionsUsers) webhookBody.allowed_mentions.users = (await context.parseVariablesInString(action.options.allowedMentionsUsers as string)).split(' ')
	}

	instance.log('debug', `Sending Webhook message to ${url} with body:`)
	instance.log('debug', JSON.stringify(webhookBody, null, 2))

	await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(webhookBody),
	})
		.then(async (res) => {
			if (res.status != 204) return res.text()
			return ''
		})
		.then((res) => {
			if (res) instance.log('warn', `Webhook err: ${res}`)
		})
		.catch((err) => instance.log('warn', `Webhook err: ${err}`))
}
