# companion-module-discord-api

This module is in a BETA state, there is still work to be done on reconnection logic to prevent duplicate connections or listeners.

The full release version of this module will use a dedicated Companion app associated with Discord and not require every user to create their own individual apps in the Discord Developer Console. This is still waiting on Discord Developer Relations staff to respond to approving of the Companion app.

# Changelog
**v1.5.1**
- Added a checkbox in the config settings to clear current OAuth tokens and require re-authorization when that config is saved. Requires restarting the connection
- Fixed an issue with subscribing to topics that the OAuth token lacks scopes for, requiring the user to re-auth rather than crash
- Added more logging at various stages of the connection and event subscription process, and more error logging
- Fixed an issue due to a change in Discord itself that required adding a delay before sending certain requests in the startup process

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
