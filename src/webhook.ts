import { type SomeCompanionActionInputField, createModuleLogger } from '@companion-module/base'
import type DiscordInstance from './index.js'

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

const log = createModuleLogger('Webhooks')

const customWebhookTemplate = {
	content: 'Message Content',
	username: 'Some Username',
	avatar_url: 'Avatar URL',
	embeds: [
		{
			title: '',
			description: '',
			url: '',
			color: 5793266,
			footer: {
				text: '',
				icon_url: '',
			},
			author: {
				name: '',
				url: '',
				icon_url: '',
			},
			image: {
				url: '',
			},
			thumbnail: {
				url: '',
			},
			timestamp: '2026-08-22T15:53:00.000Z',
			fields: [
				{
					name: '',
					value: '',
					inline: false,
				},
			],
		},
	],
}

export const generateWebhookOptions = (): SomeCompanionActionInputField[] => {
	const embed: SomeCompanionActionInputField[] = [
		{
			type: 'checkbox',
			label: 'Embed',
			description: 'Enable to show Embed related options',
			id: 'embed',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
			disableAutoExpression: true,
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
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Author URL',
			id: 'embed1AuthorURL',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Author Icon URL',
			id: 'embed1AuthorIconURL',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Title',
			id: 'embed1Title',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Title URL',
			id: 'embed1URL',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Description',
			id: 'embed1Description',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'number',
			label: 'Number of Fields',
			description: 'Valid Values: 0 to 26',
			id: 'embed1Fields',
			default: 0,
			min: 0,
			max: 26,
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
			disableAutoExpression: true,
		},
	]

	for (let i = 1; i < 26; i++) {
		embed.push(
			{
				type: 'textinput',
				label: `Field ${i} Name`,
				id: `embed1Field${i}Name`,
				default: '',
				isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true && $(options:embed1Fields) >= ${i}`,
			},
			{
				type: 'textinput',
				label: `Field ${i} Value`,
				id: `embed1Field${i}Value`,
				default: '',
				isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true && $(options:embed1Fields) >= ${i}`,
			},
			{
				type: 'checkbox',
				label: `Field ${i} Inline`,
				id: `embed1Field${i}Inline`,
				default: false,
				isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true && $(options:embed1Fields) >= ${i}`,
			},
		)
	}

	embed.push(
		{
			type: 'textinput',
			label: 'Embed Thumbnail URL',
			id: 'embed1ThumbnailURL',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Embed Image URL',
			id: 'embed1ImageURL',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Embed Footer Text',
			id: 'embed1Footer',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Embed Footer Icon URL',
			id: 'embed1FooterIconURL',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
		{
			type: 'textinput',
			label: 'Embed Timestamp (2025-12-31T12:00:00.000Z format)',
			id: 'embed1Timestamp',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:embed) === true`,
		},
	)

	const poll: SomeCompanionActionInputField[] = [
		{
			type: 'checkbox',
			label: 'Poll',
			description: 'Enable to show Poll related options',
			id: 'poll',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
			disableAutoExpression: true,
		},
		{
			type: 'textinput',
			label: 'Poll Question',
			id: 'pollQuestion',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:poll) === true`,
		},
	]

	for (let i = 1; i < 11; i++) {
		let visibility = `!$(options:useCustomBody) && $(options:poll) === true`

		poll.push({
			type: 'textinput',
			label: `Poll Answer ${i}`,
			id: `pollAnswer${i}`,
			default: '',
			isVisibleExpression: visibility,
		})
	}

	const options: SomeCompanionActionInputField[] = [
		{
			type: 'textinput',
			label: 'Webhook URL',
			id: 'url',
			default: '',
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
			default: JSON.stringify(customWebhookTemplate, null, 2),
			isVisibleExpression: `$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Username',
			description: 'Leave blank to use Webhook settings',
			id: 'username',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Avatar URL',
			description: 'Leave blank to use Webhook settings',
			id: 'avatarURL',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'textinput',
			label: 'Content',
			description: 'Up to 2000 characters',
			id: 'content',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody)`,
		},

		...embed,
		...poll,

		{
			type: 'checkbox',
			label: 'TTS',
			description: 'Enable to send the message spoken as with the /tts command',
			id: 'tts',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
		},
		{
			type: 'checkbox',
			label: 'Allowed Mentions',
			description: 'Control who will be pinged by the message. See https://discord.com/developers/docs/resources/message#allowed-mentions-object',
			id: 'allowedMentions',
			default: false,
			isVisibleExpression: `!$(options:useCustomBody)`,
			disableAutoExpression: true,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Parse',
			description: 'Space separated, not to be used alongside Users, or Roles options',
			id: 'allowedMentionsParse',
			default: 'users',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions) === true`,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Users',
			description: 'Space separated',
			id: 'allowedMentionsUsers',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions) === true`,
		},
		{
			type: 'textinput',
			label: 'Allowed Mentions - Roles',
			description: 'Space separated',
			id: 'allowedMentionsRoles',
			default: '',
			isVisibleExpression: `!$(options:useCustomBody) && $(options:allowedMentions) === true`,
		},
	]

	return options
}

export const webhookAction = async (_instance: DiscordInstance, action: any): Promise<void> => {
	const url = action.options.url
	let webhookBody: WebhookBody = {
		username: '',
		avatar_url: '',
		embeds: [],
		tts: action.options.tts as boolean,
	}

	if (!url) {
		log.warn('Invalid Webhook URL')
		return
	}

	if (action.options.useCustomBody) {
		webhookBody = JSON.parse(action.options.customBody)
	} else {
		if (action.options.username) webhookBody.username = action.options.username
		if (action.options.avatarURL) webhookBody.avatar_url = action.options.avatarURL
		if (action.options.content) webhookBody.content = action.options.content

		if (action.options.embed) {
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
					if (j === fieldCount && action.options[`embed1Field${j}Name`]) {
						embedOptions.fields.push({
							name: action.options[`embed1Field${j}Name`],
							value: action.options[`embed1Field${j}Value`],
							inline: action.options[`embed1Field${j}Inline`] as boolean,
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
					icon_url: action.options[`embed1FooterIconURL`],
				}
			}
			if (action.options[`embed1Timestamp`]) embedOptions.timestamp = action.options[`embed1Timestamp`]

			if (JSON.stringify(embedOptions) !== '{}') webhookBody.embeds.push(embedOptions)
		}

		if (action.options.poll) {
			webhookBody.poll = {
				question: {
					text: action.options.pollQuestion,
				},
				answers: [],
				allow_multiselect: action.options.pollMultiSelect as boolean,
			}

			let answers = 1
			for (let i = 1; i < 11; i++) {
				if (i === answers && action.options[`pollAnswer${i}`]) {
					webhookBody.poll.answers.push({ poll_media: { text: action.options[`pollAnswer${i}`] } })
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
	}

	log.debug(`Sending Webhook message to ${url} with body:`)
	log.debug(JSON.stringify(webhookBody, null, 2))

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
			if (res) log.warn(`Webhook err: ${res}`)
		})
		.catch((err) => log.warn(`Webhook err: ${err}`))
}
