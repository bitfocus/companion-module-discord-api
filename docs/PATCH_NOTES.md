# Patch Notes
**v1.5.0**
- Added a `Send Webhook Message` action, to assist in creating a Webhook message
- Based on the work by @Khepricus in #47 the following has been added:
- New Actions:
  - `Set Input Mode` to change between PTT and Voice Activation
  - `Push to Talk` to activate/deactivate mic when using PTT mode
  - `Play Soundboard Sound` to send a Soundboard Sound to the current Voice Channel (note: You still need Discord Nitro to use sounds from other servers)
  - `Video - Toggle Camera` and `Video - Toggle Screen Share` Toggle sending Video/Sharing a screen when in a Voice Channel
- New Feedbacks:
  - `Voice - Self Input Mode` Indicating if PTT or Voice Activation is set to control mic activation
  - `Voice - Self Mic Active` and `Voice - Other Mic Active` a simple feedback alternative to indicate if a users mic is active
  - `Video - Camera Active` and `Video - Screen Share Active` indicate if you're currently sending a camera feed or screen share in a Voice Channel
- New Variables:
  - `voice_self_input_mode`, `voice_self_mic_active`, `video_camera_active`, and `video_screen_share_active`
- Several new Presets covering some of the new Actions and Feedbacks

**v1.4.0**
- Updated to Node 22, and a new Discord library
- Added OAuth Refresh Token handling
- Added additional logging, and a debug HTTP endpoint

**v1.3.1**
- Added button options for Rich Presence action

**v1.3.0**
- Added Rich Presence action. When used it will show the user as playing whatever the name of the app is, as well as optionally show image assets that have been uploaded to the Discord Developer console.

**v1.2.3**
- Fixed crash when disconnecting from a chat channel while users are speaking

**v1.2.2**
- Fixed variables bug crashing new Discord instances

**v1.2.1**
- Fixed variables bug blocking feedback updating

**v1.2.0**
- Added new variables `voice_user_X_volume`, `voice_user_X_mute`, `voice_user_X_self_mute`, `voice_user_X_self_deaf`, `voice_user_X_speaking`, where X is the users index, nick, or ID
- Added new variables for the current speaker `voice_current_speaker_id`, `voice_current_speaker_nick`, `voice_current_speaker_number`
- Added config option for Speaker Delay between 0ms and 10000ms (default 0ms)
- The new Current Speaker system will update `voice_current_speaker_number` with the most recent speaker if they've been speaking for at least the set delay. `voice_user_X_speaking` also uses this same delay.

**v1.1.3**
- Fixed an issue with errors not correctly logging
- Fixed an issue with packaging by switching to a forked discord-rpc module

**v1.1.2**
- Fixed an issue creating a new Instance without existing config

**v1.1.0**
- Switched to `companion-module-utils` to handle the generation of voice channel user states
- Fixed an issue with login error handling

**v0.1.2**
- Changed how png64s are loaded
- Updated Typescript to ~4.6

**v0.1.0**
- Initial Version
- Most actions/feedback covered
- Reconnect logic is Work-In-Progress
