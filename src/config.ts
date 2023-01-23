import { SomeCompanionConfigField } from '@companion-module/base'

export interface Config {
	//
	accessToken?: string
	clientID: string
	clientSecret: string
	refreshToken?: string
}

export const getConfigFields = (): SomeCompanionConfigField[] => {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: `This module is currently in early beta, as such it requires users to provide their own Discord App Client ID and Secret. Once Discord verify the Companion app, this wont be required.
				<br /><br />
        1. Go to <a href="https://discord.com/developers/applications" target="_blank">https://discord.com/developers/applications</a> and create a 'New Application'.
				<br />
        2. Select the application created, and go to the OAuth2 tab in the menu on the left.
        <br />
        3. In the Redirects section, add http://localhost as a redirect URL.
        <br />
        4. Copy the Client ID, and Client Secret, and paste into the config below.`,
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
	]
}
