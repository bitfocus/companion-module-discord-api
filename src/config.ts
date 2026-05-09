import { SomeCompanionConfigField } from '@companion-module/base'

export type Config = {
	accessToken?: string
	refreshToken?: string
	clientID: string
	clientSecret: string
	speakerDelay: number
	clearOAuth: boolean
	preV3: boolean
}

export const getConfigFields = (): SomeCompanionConfigField[] => {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: `
                This module is currently in early beta, as such it requires users to provide their own Discord App Client ID and Secret. Once Discord verify the Companion app, this wont be required.
				    <br />
				    <br />
                1. Go to <a href="https://discord.com/developers/applications" target="_blank">https://discord.com/developers/applications</a> and create a 'New Application'.
				    <br />
                2. Select the application created, and go to the OAuth2 tab in the menu on the left.
                    <br />
                3. In the Redirects section, add http://localhost as a redirect URL.
                    <br />
                4. Copy the Client ID, and Client Secret, and paste into the config below.
        `,
		},
		{
			type: 'textinput',
			label: 'Client ID',
			id: 'clientID',
			width: 6,
			default: '',
		},
		{
			type: 'textinput',
			label: 'Client Secret',
			id: 'clientSecret',
			width: 6,
			default: '',
		},
		{
			type: 'number',
			label: 'Speaker Delay (ms a user has to speak before indicating updating speaking variables)',
			id: 'speakerDelay',
			width: 12,
			default: 0,
			min: 0,
			max: 10000,
		},
		{
			type: 'checkbox',
			label: 'Clear OAuth tokens and re-auth on next connection startup',
			id: 'clearOAuth',
			width: 12,
			default: false,
		},
		{
			type: 'static-text',
			id: 'infoPreV3',
			width: 12,
			label: 'Pre v3 API compatibility',
			value: `
                Pre-v3 variables are kept for compatibility with existing setups.
                    <br />
                For new or updated setups, please disable the next option.
                When disabled, every pre-v3 variable in this module is automatically disabled, but when enabled, all pre-v3 variable are added.
                    <br /><br />
                This is to allow users to transition at their own pace, and to allow users to keep using their existing setups without having to update them immediately.
            `,
		},
		{
			type: 'checkbox',
			label: 'Add pre v3 variables structure',
			id: 'preV3',
			width: 12,
			default: true,
		},
	]
}
