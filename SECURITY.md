# Security Policy

## Supported versions

Only the latest version on the `main` branch is actively supported.

## Reporting a vulnerability

Do not post tokens, credentials, or exploitable details in a public issue. Open a private GitHub security advisory or contact the repository owner through GitHub.

If a Discord bot token may have been exposed:

1. Open the Discord Developer Portal.
2. Reset the bot token immediately.
3. Replace the hosting secret.
4. Restart the bot.
5. Review recent commits and hosting logs.

The `.gitignore` excludes `.env`. Never commit real credentials.
