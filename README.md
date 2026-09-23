# Free Discord Bot

A free, open-source Discord bot for sharing bots, guides, support, moderation, and community tools. This repository is bot-only: there is no website.

## Features

- `/setup welcomer` for welcome, command, shop, and verification channels
- `/setuproles` for owner, co-owner, and admin roles
- `/setupserver` creates a polished starter layout automatically
- `/setup tickets` configures a button + dropdown ticket panel
- Private tickets with manual close buttons and automatic inactivity closing
- `/knowledge add`, `/knowledge list`, and `/knowledge remove` for bot guides
- `/ask` answers from administrator-provided bot information and never invents missing instructions
- Buttons, emojis, embeds, dropdown UI, role-safe permissions, and persistent data

## Railway deployment

1. Create a Railway service from this GitHub repository.
2. Add a Railway Volume and mount it at `/data`.
3. Add `DISCORD_TOKEN`, `CLIENT_ID`, and optionally `GUILD_ID`.
4. Set `DATA_DIR=/data`.
5. Enable Server Members Intent and Message Content Intent in the Discord Developer Portal.
6. Give the bot the permissions it needs: View Channels, Send Messages, Embed Links, Read Message History, Manage Channels, Manage Roles where needed, and Manage Messages.

Never commit or share the bot token.

## License

MIT — free to use, modify, and redistribute.
