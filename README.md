# companion-module-discord-api

This module is in a BETA state, there is still work to be done on reconnection logic to prevent duplicate connections or listeners.

Tthe full release version of this module will use a dedicated Companion app associated with Discord and not require every user to create their own individual apps in the Discord Developer Console. This is still waiting on Discord Developer Relations staff to respend to approving of the Companion app.

# Changelog
**V1.1.3**
- Fixed an issue with errors not correctly logging
- Fixed an issue with packaging by switching to a forked discord-rpc module

**V1.1.2**
- Fixed an issue creating a new Instance without existing config

**V1.1.0**
- Switched to `comapnion-module-utils` to handle the generation of voice channel user states
- Fixed an issue with login error handling
