# companion-module-discord-api

This module is in a BETA state, there is still work to be done on reconnection logic to prevent duplicate connections or listeners.

Tthe full release version of this module will use a dedicated Companion app associated with Discord and not require every user to create their own individual apps in the Discord Developer Console. This is still waiting on Discord Developer Relations staff to respend to approving of the Companion app.

# Changelog
**V1.1.0**
- Switched to `comapnion-module-utils` to handle the generation of voice channel user states
- Fixed an issue with login error handling

**v0.1.2**
- Changed how png64s are loaded
- Updated Typescript to ~4.6

**V1.0.0**
- Updated module for Companion v3 Compatibility
- Switched to discord-rpc for Discord connection handling