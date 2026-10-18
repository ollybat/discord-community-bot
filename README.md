# Free Discord Bots — Community Bot

A free, bot-only Discord community bot for sharing bot projects, helping members, running support tickets, and managing a polished server. No website and no AI.

## Highlights

- **/setupserver** creates the complete starter layout
- **/setup welcomer** configures welcome, commands, shop, and verification channels
- **/setup tickets** configures panels, logs, category, and inactivity auto-close
- Interactive support tickets with private permissions, claim/close controls, logs, and duplicate-ticket protection
- **/poll** creates persistent 2–4 choice polls; voters can change their vote and the creator/moderators can close a poll
- **/timeout** and **/untimeout** provide timed member moderation (1 minute–28 days)
- **/warnings list** and **/warnings clear** manage recorded warnings
- **/avatar** and **/membercount** add member utilities
- **/bots** and **/shop** browse the free bot catalog; **/bot add/list/remove** manage it
- **/help**, **/config**, **/ping**, **/stats**, **/rules**, **/verify**, **/serverinfo**, and **/userinfo**
- **/purge**, **/slowmode**, **/lock**, **/unlock**, **/announce**, **/warn**, **/kick**, and **/ban**
- Persistent JSON data on a Railway Volume; malformed data fails visibly rather than being silently replaced
- No AI calls, AI keys, external model providers, traffic forwarding, or website runtime

Discord limits an application to 100 top-level global slash commands (with separate guild-scoped registrations). This bot checks that limit at startup; it focuses on implemented features instead of padding the command list with non-working placeholders.

## Railway

1. Deploy this repository as a Railway service.
2. Add a Railway Volume mounted at `/data`.
3. Add `DISCORD_TOKEN`, `CLIENT_ID`, and optionally `GUILD_ID`.
4. Set `DATA_DIR=/data`.
5. Enable Server Members Intent and Message Content Intent in the Discord Developer Portal.
6. Give the bot View Channels, Send Messages, Embed Links, Read Message History, Manage Channels, Manage Messages, Moderate Members, and other required moderation permissions.

Never commit or share `DISCORD_TOKEN`.

## First server setup

Run `/setupserver`, then customize with `/setup welcomer`, `/setup tickets`, and `/setuproles`. Add bot listings with `/bot add`; members can browse them with `/shop` or `/bots`, then select a bot for its setup details.

## License

MIT — free to use, modify, and redistribute.
