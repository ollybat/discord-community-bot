# Free Discord Community Bot

A free-to-use Discord bot starter for communities and gaming servers. Anyone can invite their own instance and use the commands without a paid subscription.

> This repository contains the source code. It does not include a shared public bot token. Each owner should create and run their own bot instance.

A small Discord bot built with `discord.js` featuring:

- `/ping` — returns the bot's API latency.
- `/help` — lists all commands.
- `/setup` — gives server administrators a step-by-step setup guide.
- `/serverinfo` — displays server membership, channels, roles, owner, creation date, and ID.
- `/userinfo` and `/avatar` — inspect users.
- `/poll` — create a yes/no reaction poll.
- `/announce` — post an announcement (Manage Messages required).
- `/clear` — delete 1–100 recent messages (Manage Messages required).
- `/kick` and `/ban` — moderation actions with reasons.
- Welcome messages and basic spam protection.

## Requirements

- Node.js 20 or newer
- A Discord application and bot token

## Setup

1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Add a **Bot** user and copy its token. Keep it secret; never commit it.
3. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `CLIENT_ID`.
4. Run:

   ```bash
   npm install
   npm start
   ```

The bot registers commands when it starts. Set `GUILD_ID` while developing for near-instant registration. Without it, commands are registered globally and may take up to an hour to appear. Run `/setup` in Discord for an administrator-friendly guide.

## Invite the bot

In the Developer Portal, open **OAuth2 → URL Generator**, select the `bot` and `applications.commands` scopes, and grant only the permissions you need: `View Channels`, `Send Messages`, `Embed Links`, `Add Reactions`, `Manage Messages`, `Kick Members`, `Ban Members`, `Moderate Members`, and `Manage Guild` for `/setup`. Do not grant `Administrator` unless absolutely necessary. Then use the generated URL to invite it.

For welcome messages, enable the **Server Members Intent** in the Developer Portal and set `WELCOME_CHANNEL_ID`. For spam protection, enable the **Message Content Intent** too. These are privileged intents; enable them in the Developer Portal before starting the bot. The bot also needs to have a role above members it should kick or ban.

## GitHub

```bash
git init
git add .
git commit -m "Add Discord ping and server info bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Do not upload `.env` or your bot token.
