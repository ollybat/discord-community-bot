# Free Discord Community Bot

A free Discord bot starter for gaming and community servers with polished commands, fun games, moderation, status diagnostics, and friendly error reporting.

## Commands

- `/ping` — quick latency and health check.
- `/status` — hosting process, Discord connection, latency, uptime, memory, and server count.
- `/help` — private organized command guide.
- `/setup` — administrator setup guide.
- `/serverinfo`, `/userinfo`, `/avatar` — server and member information.
- `/roll`, `/coinflip`, `/8ball`, `/choose` — fun commands.
- `/rps`, `/ship`, `/roast`, `/fact` — games and social commands.
- `/poll`, `/announce` — community tools.
- `/clear`, `/kick`, `/ban` — moderation commands.
- Welcome messages and basic spam protection.

## Friendly error system

If a command fails, the bot replies with a private red error card containing:

- A unique error code
- A plain-language explanation
- Suggestions to check hosting logs, Discord status, and permissions
- A `/status` troubleshooting prompt

The detailed error is logged to the hosting terminal with the same code. Tokens and stack traces are never shown in Discord.

## Setup

1. Create an application at https://discord.com/developers/applications and add a Bot user.
2. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` and `CLIENT_ID`.
3. Enable Server Members Intent for welcomes and Message Content Intent for spam protection.
4. Invite with `bot` and `applications.commands`. Grant only the permissions you need; do not grant Administrator.
5. Run:

   ```bash
   npm install
   npm start
   ```

Set `GUILD_ID` for fast command updates during development and `WELCOME_CHANNEL_ID` for welcome messages. Never commit `.env` or share your bot token.

## Hosting troubleshooting

Use `/status` in Discord. If it reports a connection problem, inspect the hosting logs, confirm the process is running, verify the token in the hosting secret configuration, and check Discord's service status. If one command fails, copy only its error code—not your token—and use it to find the matching log line.

## License

MIT — free to use and modify.
