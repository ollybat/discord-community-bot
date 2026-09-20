# Free Discord Community Bot

A polished, free Discord bot for gaming and community servers. It combines fun commands, useful server tools, moderation, welcome messages, diagnostics, safe error cards, and clean embeds.

## Commands

### Health and setup
- `/ping` — latency and health.
- `/status` — Discord connection, uptime, memory, hosting-process status, and server count.
- `/setup` — administrator setup guide.
- `/permissions` — checks the bot’s effective permissions in the current channel.
- `/invite` — generates a safe invite link for this bot.

### Server and members
- `/serverinfo` — detailed server information.
- `/membercount` — people, bots, and total members.
- `/servericon` — opens the server icon in full size.
- `/userinfo` — member details and roles.
- `/avatar` — full-size profile image.

### Fun and games
- `/roll`, `/coinflip`, `/8ball`, `/choose`
- `/rps`, `/ship`, `/roast`, `/fact`
- `/poll` — polished multi-choice reaction poll.

### Community and moderation
- `/announce` — rich announcement embed.
- `/clear` — remove recent messages.
- `/kick` and `/ban` — protected moderation actions.
- Welcome messages and rate-limited spam protection.

## Error and hosting status system

Failed commands return a private red error card with a unique code and suggestions to check hosting logs, Discord status, and permissions. `/status` reports the bot process health. Detailed failures are logged with the same code; tokens and stack traces are never shown in Discord.

## Setup

1. Create an app at https://discord.com/developers/applications and add a Bot user.
2. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `CLIENT_ID`.
3. Enable Server Members Intent for welcomes and Message Content Intent for spam protection.
4. Invite using `bot` and `applications.commands`. Review permissions and do not grant Administrator.
5. Run `npm install` and `npm start`.

Set `GUILD_ID` for fast command updates during development and `WELCOME_CHANNEL_ID` for welcome messages. Never commit `.env` or share your token.

## Hosting troubleshooting

Run `/status`. If it reports a connection problem, inspect the host logs, confirm the process is running, verify the token in the host’s secret settings, and check Discord’s service status. If a command fails, copy only its error code—not credentials.

## License

MIT — free to use and modify.
