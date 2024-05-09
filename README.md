# companion-module-discord-api

This module is in a BETA state, there is still work to be done on reconnection logic to prevent duplicate connections or listeners.

Tthe full release version of this module will use a dedicated Companion app associated with Discord and not require every user to create their own individual apps in the Discord Developer Console. This is still waiting on Discord Developer Relations staff to respond to approving of the Companion app.

# Changelog
**V1.3.0**
- Added Rich Presence action. When used it will show the user as playing whatever the name of the app is, as well as optionally show image assets that have been uploaded to the Discord Developer console.

**V1.2.3**
- Fixed crash when disconnecting from a chat channel while users are speaking

**V1.2.2**
- Fixed variables bug crashing new Discord instances

**V1.2.1**
- Fixed variables bug blocking feedback updating

**V1.2.0**
- Added new variables `voice_user_X_volume`, `voice_user_X_mute`, `voice_user_X_self_mute`, `voice_user_X_self_deaf`, `voice_user_X_speaking`, where X is the users index, nick, or ID
- Added new variables for the current speaker `voice_current_speaker_id`, `voice_current_speaker_nick`, `voice_current_speaker_number`
- Added config option for Speaker Delay between 0ms and 10000ms (default 0ms)
- The new Current Speaker system will update `voice_current_speaker_number` with the most recent speaker if they've been speaking for at least the set delay. `voice_user_X_speaking` also uses this same delay.

**V1.1.3**
- Fixed an issue with errors not correctly logging
- Fixed an issue with packaging by switching to a forked discord-rpc module

**V1.1.2**
- Fixed an issue creating a new Instance without existing config
