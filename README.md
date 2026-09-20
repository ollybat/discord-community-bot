# Free Discord Community Bot

A free-to-use Discord bot starter for communities and gaming servers. It includes polished embeds, fun mini-games, moderation, validation, cooldowns, welcome messages, polls, spam protection, and safer mention handling.

> This repository contains source code only. It does not include a shared public bot token. Each server owner should create and run their own bot instance.

## Commands

- `/ping` — health, latency, uptime, server count, and Node.js version.
- `/help` — private organized command guide.
- `/setup` — administrator setup guide.
- `/serverinfo`, `/userinfo`, `/avatar` — server and member information.
- `/roll`, `/coinflip`, `/8ball`, `/choose` — player fun commands.
- `/rps` — rock, paper, scissors against the bot.
- `/ship` — playful friendship score.
- `/roast` — harmless roast.
- `/fact` — community or gaming fact.
- `/poll` — multi-choice reaction poll.
- `/announce` — polished staff announcement embed.
- `/clear`, `/kick`, `/ban` — moderation commands.
- Welcome messages and basic spam protection.

## Setup

1. Create an application at https://discord.com/developers/applications and add a Bot user.
2. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `CLIENT_ID`.
3. Enable Server Members Intent for welcomes and Message Content Intent for spam protection.
4. Invite with the `bot` and `applications.commands` scopes. Grant only needed permissions; do not grant Administrator.
5. Install and run:

   ```bash
   npm install
   npm start
   ```

Set `GUILD_ID` for fast command updates while developing. Set `WELCOME_CHANNEL_ID` for welcome messages. Run `/setup` in Discord for an in-server guide.

## Safety

Never commit `.env` or your bot token. If a token is exposed, reset it immediately in the Developer Portal. Keep playful commands friendly and use moderation permissions responsibly.

## License

MIT — free to use and modify.
