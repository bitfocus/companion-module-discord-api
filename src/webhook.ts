import type DiscordInstance from './index.js'
import { CompanionActionEvent, SomeCompanionActionInputField } from '@companion-module/base'
import { IntRange } from './utils.js'

type WebhookBody = {
	username?: string
	avatar_url?: string
	content?: string
	embeds?: WebhookEmbed[]
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
	allow_multiselect?: boolean
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

export type WebhookActionValues = {
	url: string
	useCustomBody: boolean
	customBody?: string | WebhookBody
	username?: string
	avatarURL?: string
	content?: string
	embed?: boolean
	embed1Color?: number
	embed1AuthorName?: string
	embed1AuthorURL?: string
	embed1AuthorIconURL?: string
	embed1Title?: string
	embed1URL?: string
	embed1Description?: string
	embed1Fields?: number
	embed1ThumbnailURL?: string
	embed1ImageURL?: string
	embed1Footer?: string
	embed1FooterIconURL?: string
	embed1Timestamp?: string
	poll?: boolean
	pollQuestion?: string
	pollMultiSelect?: boolean
	pollAnswers?: number
	tts?: boolean
	allowedMentions?: boolean
	allowedMentionsParse?: string
	allowedMentionsUsers?: string
	allowedMentionsRoles?: string
} & {
	[Key in `embed1Field${IntRange<1, 26>}Name` | `embed1Field${IntRange<1, 26>}Value` | `pollAnswer${IntRange<1, 11>}`]?: string
} & {
	[Key in `embed1Field${IntRange<1, 26>}Inline`]?: boolean
}

type WebhookActionInputField = SomeCompanionActionInputField<keyof WebhookActionValues>

const webhookExample: WebhookBody = {
	username: 'bitfocus companion',
	avatar_url: 'https://bitfocus.io/assets/products/companion/companion.png',
	content: 'message',
	embeds: [
		{
			color: 0xff0000,
			author: { name: 'embed 1 author name', url: 'http://embed1.avatar.url/', icon_url: 'http://embed1.avatar.icon.url/' },
			title: 'embed 1 title',
			url: 'http://embed1.title.url',
			description: 'embed 1 description',
			fields: [{ name: 'embed 1 field 1 name', value: 'embed 1 field 1 value', inline: false }],
			thumbnail: { url: 'http://embed1.thumbnail.url/' },
			image: { url: 'http://embed1.image.url/' },
			footer: { text: 'embed 1 footer text', icon_url: 'http://embed1.footer.icon.url/' },
			timestamp: '2025-12-31T12:00:00.000Z',
		},
	],
	tts: false,
}

export const generateWebhookOptions = (): WebhookActionInputField[] => {
	const embed: WebhookActionInputField[] = [
		{
			type: 'checkbox',
			label: 'Embed',
			tooltip: 'Enable to show Embed related options',
			id: 'embed',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody) && !$(options:poll)`,
			disableAutoExpression: true,
		},
		{
			type: 'colorpicker',
			label: 'Embed Color',
			id: 'embed1Color',
			default: 0,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Author Name',
			id: 'embed1AuthorName',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Author URL',
			id: 'embed1AuthorURL',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Author Icon URL',
			id: 'embed1AuthorIconURL',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Title',
			id: 'embed1Title',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Title URL',
			id: 'embed1URL',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Description',
			id: 'embed1Description',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'dropdown',
			label: 'Number of fields',
			id: 'embed1Fields',
			default: 0,
			choices: new Array(26).fill(0).map((_, i) => ({ id: i, label: i.toString() })),
			disableAutoExpression: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
	]

	for (let i = 1; i < 26; i++) {
		const visibility = `!$(options:useCustomBody) && $(options:embed) && $(options:embed1Fields) >= ${i}`

		embed.push(
			{
				type: 'textinput',
				label: `Field ${i} Name`,
				id: `embed1Field${i as IntRange<1, 26>}Name`,
				default: '',
				isVisibleExpression: visibility,
				useVariables: true,
			},
			{
				type: 'textinput',
				label: `Field ${i} Value`,
				id: `embed1Field${i as IntRange<1, 26>}Value`,
				default: '',
				isVisibleExpression: visibility,
				useVariables: true,
			},
			{
				type: 'checkbox',
				label: `Field ${i} Inline`,
				id: `embed1Field${i as IntRange<1, 26>}Inline`,
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
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Embed Image URL',
			id: 'embed1ImageURL',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Embed Footer Text',
			id: 'embed1Footer',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Embed Footer Icon URL',
			id: 'embed1FooterIconURL',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
		{
			type: 'textinput',
			label: 'Embed Timestamp (2025-12-31T12:00:00.000Z format)',
			id: 'embed1Timestamp',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed)`,
		},
	)

	const poll: WebhookActionInputField[] = [
		{
			type: 'checkbox',
			label: 'Poll',
			tooltip: 'Enable to show Poll related options',
			id: 'poll',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody) && !$(options:embed)`,
			disableAutoExpression: true,
		},
		{
			type: 'textinput',
			label: 'Poll Question',
			id: 'pollQuestion',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:poll)`,
			useVariables: true,
		},
		{
			type: 'dropdown',
			label: 'Number of answers',
			id: 'pollAnswers',
			default: 2,
			choices: new Array(9).fill(0).map((_, i) => ({ id: i + 2, label: (i + 2).toString() })),
			disableAutoExpression: true,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:poll)`,
		},
	]

	for (let i = 1; i < 11; i++) {
		poll.push({
			type: 'textinput',
			label: `Poll Answer ${i}`,
			id: `pollAnswer${i as IntRange<1, 11>}`,
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:poll) && $(options:pollAnswers) >= ${i}`,
			useVariables: true,
		})
	}

	const options: WebhookActionInputField[] = [
		{
			type: 'textinput',
			label: 'Webhook URL',
			id: 'url',
			default: '',
			useVariables: true,
		},
		{
			type: 'checkbox',
			label: 'Use Custom Webhook Body',
			id: 'useCustomBody',
			default: false,
			disableAutoExpression: true,
		},
		{
			type: 'textinput',
			label: 'Custom Webhook Body',
			id: 'customBody',
			description: 'Please, prefer the expression vue for a better usage',
			expressionDescription: '',
			default: JSON.stringify(webhookExample, null, 2),
			useVariables: true,
			isVisibleExpression: `$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Username',
			tooltip: 'Leave blank to use Webhook settings',
			id: 'username',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Avatar URL',
			tooltip: 'Leave blank to use Webhook settings',
			id: 'avatarURL',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Content',
			tooltip: 'Up to 2000 characters',
			id: 'content',
			default: '',
			useVariables: true,
			isVisibleExpression: `!$(options:useCustomBody) && !$(options:poll)`,
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
			disableAutoExpression: true,
		},
		{
			type: 'checkbox',
			label: 'Allowed Mentions',
			tooltip: 'Control who will be pinged by the message. See https://discord.com/developers/docs/resources/message#allowed-mentions-object',
			id: 'allowedMentions',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
			disableAutoExpression: true,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Parse',
			tooltip: 'Space separated, not to be used alongside Users, or Roles options',
			id: 'allowedMentionsParse',
			default: 'users',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions)`,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Users',
			tooltip: 'Space separated',
			id: 'allowedMentionsUsers',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions)`,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Roles',
			tooltip: 'Space separated',
			id: 'allowedMentionsRoles',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions)`,
		},
	]

	return options
}

const sendWebhook = async (url: string, webhookBody: WebhookBody, instance: DiscordInstance) => {
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

export const webhookAction = async (instance: DiscordInstance, action: CompanionActionEvent<WebhookActionValues>): Promise<void> => {
	if (!action.options.url) {
		instance.log('warn', 'Invalid Webhook URL')
		return
	}

	if (action.options.useCustomBody) {
		let customBody: WebhookBody
		if (typeof action.options.customBody === 'string') {
			try {
				customBody = JSON.parse(action.options.customBody)
			} catch (err) {
				instance.log('warn', `Invalid custom webhook body JSON: ${err}`)
				return
			}
		} else {
			customBody = action.options.customBody ?? ({} as any)
		}
		return await sendWebhook(action.options.url, customBody, instance)
	}

	const webhookBody: WebhookBody = {
		tts: action.options.tts as boolean,
	}

	if (action.options.username) webhookBody.username = action.options.username
	if (action.options.avatarURL) webhookBody.avatar_url = action.options.avatarURL
	if (action.options.content && !action.options.poll) webhookBody.content = action.options.content

	if (action.options.embed) {
		webhookBody.embeds = []
		const embedOptions: WebhookEmbed = {
			color: action.options[`embed1Color`] as number,
			fields: [],
		}

		if (action.options[`embed1AuthorName`]) {
			embedOptions.author = {
				name: action.options[`embed1AuthorName`],
			}

			if (action.options[`embed1AuthorURL`]) embedOptions.author.url = action.options[`embed1AuthorURL`]
			if (action.options[`embed1AuthorIconURL`]) embedOptions.author.icon_url = action.options[`embed1AuthorIconURL`]
		}

		if (action.options[`embed1Title`]) embedOptions.title = action.options[`embed1Title`]
		if (action.options[`embed1URL`]) embedOptions.url = action.options[`embed1URL`]
		if (action.options[`embed1Description`]) embedOptions.description = action.options[`embed1Description`]

		if (action.options[`embed1Fields`]) {
			let fieldCount = 1
			for (let j = 1; j < 26; j++) {
				if (j === fieldCount && action.options[`embed1Field${j as IntRange<1, 26>}Name`]) {
					embedOptions.fields.push({
						name: action.options[`embed1Field${j as IntRange<1, 26>}Name`] as string,
						value: action.options[`embed1Field${j as IntRange<1, 26>}Value`] as string,
						inline: action.options[`embed1Field${j as IntRange<1, 26>}Inline`] as boolean,
					})

					fieldCount++
				}
			}
		}

		if (action.options[`embed1ThumbnailURL`]) embedOptions.thumbnail = { url: action.options[`embed1ThumbnailURL`] }
		if (action.options[`embed1ImageURL`]) embedOptions.image = { url: action.options[`embed1ImageURL`] }
		if (action.options[`embed1Footer`]) {
			embedOptions.footer = {
				text: action.options[`embed1Footer`],
				icon_url: action.options[`embed1FooterIconURL`] as string,
			}
		}
		if (action.options[`embed1Timestamp`]) embedOptions.timestamp = action.options[`embed1Timestamp`]

		if (JSON.stringify(embedOptions) !== '{}') webhookBody.embeds.push(embedOptions)
	}

	if (action.options.poll) {
		webhookBody.poll = {
			question: {
				text: action.options.pollQuestion as string,
			},
			answers: [],
			allow_multiselect: action.options.pollMultiSelect as boolean,
		}

		let answers = 1
		for (let i = 1; i < 11; i++) {
			if (i === answers && action.options[`pollAnswer${i as IntRange<1, 11>}`]) {
				webhookBody.poll.answers.push({ poll_media: { text: action.options[`pollAnswer${i as IntRange<1, 11>}`] as string } })
				answers++
			}
		}
	}

	if (action.options.allowedMentions) {
		webhookBody.allowed_mentions = {}
		if (action.options.allowedMentionsParse) webhookBody.allowed_mentions.parse = action.options.allowedMentionsParse.split(' ')
		if (action.options.allowedMentionsRoles) webhookBody.allowed_mentions.roles = action.options.allowedMentionsRoles.split(' ')
		if (action.options.allowedMentionsUsers) webhookBody.allowed_mentions.users = action.options.allowedMentionsUsers.split(' ')
	}

	instance.log('debug', `Sending Webhook message to ${action.options.url} with body:`)
	instance.log('debug', JSON.stringify(webhookBody, null, 2))

	await sendWebhook(action.options.url, webhookBody, instance)
}
