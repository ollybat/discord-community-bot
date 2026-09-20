# Free Discord Community Bot

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A free Discord bot for gaming and community servers. It combines polished embeds, fun games, server tools, moderation, welcome messages, diagnostics, safe error cards, structured logging, memory cleanup, graceful shutdown, and an administrator setup guide.

> **Security:** this repository contains source code only. Never commit `.env` or share a Discord bot token.

## Highlights

- 🎮 Player games: dice, coin flip, 8-ball, random choice, RPS, friendship scores, roasts, and facts
- 🛡️ Moderation: clear, kick, ban, cooldowns, role-hierarchy checks, and spam protection
- 🔧 Server tools: server information, member counts, live voice counts, server icon, role overview, invite helper, bot info, and permission diagnostics
- 📈 Presence: the bot bio shows the total member count across all servers it serves
- 📊 Community: multi-choice polls, rich announcements, welcome embeds, and private help/setup guides
- 🩺 Reliability: `/ping`, `/status`, structured error codes, safe logs, rate-limit warnings, input limits, cooldown cleanup, graceful login errors, and clean shutdown handling

## Commands

| Category | Commands |
| --- | --- |
| Diagnostics | `/ping`, `/status`, `/permissions` |
| Setup | `/setup`, `/invite`, `/botinfo` |
| Server | `/serverinfo`, `/membercount`, `/channelcount`, `/servericon`, `/serverroles` |
| Members | `/userinfo`, `/avatar` |
| Fun | `/roll`, `/coinflip`, `/8ball`, `/choose`, `/rps`, `/ship`, `/roast`, `/fact` |
| Community | `/poll`, `/announce` |
| Moderation | `/clear`, `/kick`, `/ban` |

## Quick start

### 1. Create the Discord application

Create an application in the [Discord Developer Portal](https://discord.com/developers/applications), add a Bot user, and copy its token. Keep it secret.

### 2. Configure environment variables

Use the Discord Developer Portal values exactly as follows:

- `DISCORD_TOKEN` — Bot page → **Reset Token / Copy Token**
- `CLIENT_ID` — General Information → **Application ID**; it should contain only numbers
- `GUILD_ID` — optional numeric ID of your test server

If logs say `application_id ... is not snowflake`, `CLIENT_ID` contains the token or another non-numeric value. Replace it with the numeric Application ID and redeploy.

```bash
cp .env.example .env
```

Fill in `DISCORD_TOKEN` and `CLIENT_ID`. **`CLIENT_ID` must be the numeric Application ID from the Discord Developer Portal, not the bot token.** Set `GUILD_ID` for quick command updates during development. Set `WELCOME_CHANNEL_ID` for welcome messages.

### 3. Enable intents

Enable **Server Members Intent** for welcome messages and **Message Content Intent** for spam protection in the Developer Portal.

### 4. Install and run

```bash
npm install
npm run check
npm start
```

### 5. Invite the bot

Use the `bot` and `applications.commands` scopes. Grant only the permissions needed by your server. Do not grant `Administrator` unless you fully understand the risk. The bot role must be above members it moderates.

## Error handling and hosting

When a command fails, the bot returns a private red error card with a unique code and troubleshooting steps. The same code is written to the hosting terminal without exposing tokens or stack traces.

Run `/status` to see Discord connectivity, latency, uptime, memory, and server count. If the bot is offline, check the hosting process, secret configuration, Discord Developer Portal, and service status.

## Project files

- `index.js` — bot commands, events, validation, moderation, status diagnostics, structured logs, cleanup, and error handling
- `.env.example` — safe configuration template
- `package.json` — dependencies and scripts
- `LICENSE` — MIT license
- `SECURITY.md` — token and vulnerability guidance
- `CONTRIBUTING.md` — development and pull request guide

## License

MIT — free to use and modify. See [LICENSE](LICENSE).
