# Free Discord Bots — Community Bot

A free, bot-only Discord community bot for sharing bot projects, helping members, running support tickets, and managing a polished server. No website and no AI.

## Highlights

- `/setupserver` creates the complete starter layout
- `/setup welcomer` configures welcome, commands, shop, and verification channels
- `/setup tickets` configures panels, logs, ticket category, and 1–24 hour inactivity auto-close
- `/setuproles` stores owner, co-owner, admin, and optional support roles
- Interactive ticket buttons and category dropdowns
- Ticket claim, close, logs, private permissions, duplicate-ticket protection, and persistent activity timestamps
- `/bots` free bot shop browser
- `/bot add`, `/bot list`, and `/bot remove` catalog management
- `/ticketpanel` posts a new ticket UI
- `/help`, `/config`, `/ping`, `/serverinfo`, and `/userinfo`
- `/purge`, `/slowmode`, `/lock`, `/unlock`, `/announce`, `/warn`, `/kick`, and `/ban`
- Persistent JSON data on a Railway Volume
- No AI calls, AI keys, external model providers, traffic forwarding, or website runtime

## Railway

1. Deploy this repository as a Railway service.
2. Add a Railway Volume mounted at `/data`.
3. Add `DISCORD_TOKEN`, `CLIENT_ID`, and optionally `GUILD_ID`.
4. Set `DATA_DIR=/data`.
5. Enable Server Members Intent and Message Content Intent in the Discord Developer Portal.
6. Give the bot View Channels, Send Messages, Embed Links, Read Message History, Manage Channels, Manage Messages, and moderation permissions as needed.

Never commit or share `DISCORD_TOKEN`.

## First server setup

Run `/setupserver`, then optionally customize with `/setup welcomer`, `/setup tickets`, and `/setuproles`. Add bot listings with `/bot add`; users can browse them with `/bots`.

## License

MIT — free to use, modify, and redistribute.
