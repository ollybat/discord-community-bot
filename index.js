import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';

const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
for (const name of required) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check the bot latency.'),
  new SlashCommandBuilder().setName('help').setDescription('List the bot commands.'),
  new SlashCommandBuilder().setName('setup').setDescription('Show the steps and permissions needed to set up this bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Show information about this Discord server.'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Show information about a member.')
    .addUserOption((option) => option.setName('user').setDescription('The member to inspect.')),
  new SlashCommandBuilder().setName('avatar').setDescription("Show a user's avatar.")
    .addUserOption((option) => option.setName('user').setDescription('The user whose avatar to show.')),
  new SlashCommandBuilder().setName('poll').setDescription('Create a polished poll with up to four choices.')
    .addStringOption((option) => option.setName('question').setDescription('The question to ask.').setMaxLength(250).setRequired(true))
    .addStringOption((option) => option.setName('option1').setDescription('First choice.').setMaxLength(80).setRequired(true))
    .addStringOption((option) => option.setName('option2').setDescription('Second choice.').setMaxLength(80).setRequired(true))
    .addStringOption((option) => option.setName('option3').setDescription('Optional third choice.').setMaxLength(80))
    .addStringOption((option) => option.setName('option4').setDescription('Optional fourth choice.').setMaxLength(80)),
  new SlashCommandBuilder().setName('announce').setDescription('Post a polished announcement.')
    .addStringOption((option) => option.setName('message').setDescription('Announcement text.').setMaxLength(1900).setRequired(true))
    .addStringOption((option) => option.setName('title').setDescription('Optional announcement title.').setMaxLength(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('clear').setDescription('Delete recent messages.')
    .addIntegerOption((option) => option.setName('amount').setDescription('Number of messages, from 1 to 100.').setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a member.')
    .addUserOption((option) => option.setName('user').setDescription('Member to kick.').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for the kick.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName('ban').setDescription('Ban a member.')
    .addUserOption((option) => option.setName('user').setDescription('Member to ban.').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason for the ban.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const commandRoute = process.env.GUILD_ID
  ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
  : Routes.applicationCommands(process.env.CLIENT_ID);

try {
  await rest.put(commandRoute, { body: commands });
  console.log(`Registered ${commands.length} slash commands${process.env.GUILD_ID ? ' for the configured guild' : ' globally'}.`);
} catch (error) {
  console.error('Could not register slash commands:', error);
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const recentMessages = new Map();
const spamCooldowns = new Map();
const commandList = '/ping, /help, /setup, /serverinfo, /userinfo, /avatar, /poll, /announce, /clear, /kick, /ban';
const commandHelp = new EmbedBuilder()
  .setColor(0x5865f2)
  .setTitle('Free Community Bot')
  .setDescription('Helpful tools for your server. Use a command below to get started.')
  .addFields(
    { name: '📌 General', value: '`/ping` latency • `/serverinfo` server details • `/userinfo` member details • `/avatar` profile picture' },
    { name: '🎮 Community', value: '`/poll` create a multi-choice poll • `/announce` post an announcement' },
    { name: '🛡️ Moderation', value: '`/clear` remove messages • `/kick` remove a member • `/ban` ban a member' },
    { name: '⚙️ Setup', value: '`/setup` shows the complete administrator setup guide' },
  )
  .setFooter({ text: 'Free to use • Keep the bot token private' });
const setupEmbed = () => new EmbedBuilder()
  .setColor(0x57f287)
  .setTitle('Bot setup guide')
  .setDescription('This bot is free to use. A server administrator can invite it and use these commands without paying for a subscription.')
  .addFields(
    { name: '1. Invite the bot', value: 'In the Discord Developer Portal, create an OAuth2 invite URL with the `bot` and `applications.commands` scopes.' },
    { name: '2. Give permissions', value: 'Use View Channels, Send Messages, Embed Links, Add Reactions, Manage Messages, Kick Members, Ban Members, and Moderate Members as needed.' },
    { name: '3. Enable intents', value: 'Enable Server Members Intent for welcomes. Enable Message Content Intent for spam protection.' },
    { name: '4. Configure welcomes', value: 'Set `WELCOME_CHANNEL_ID` in the bot\'s `.env` file, then restart the bot.' },
    { name: '5. Try it', value: 'Run `/help`, `/ping`, `/serverinfo`, or `/poll` in this server.' },
    { name: 'Need help?', value: 'Ask a server administrator to check the bot role position and permissions. Never share the bot token.' },
  )
  .setFooter({ text: 'Free and open starter bot • Keep your token private' });

client.once('ready', (readyClient) => {
  readyClient.user.setPresence({ activities: [{ name: '/help • free community bot' }], status: 'online' });
  console.log(`Logged in as ${readyClient.user.tag} in ${readyClient.guilds.cache.size} server(s).`);
});

client.on('guildMemberAdd', async (member) => {
  if (!process.env.WELCOME_CHANNEL_ID) return;
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (channel?.isTextBased()) {
    const welcome = new EmbedBuilder().setColor(0x57f287).setTitle(`Welcome to ${member.guild.name}!`).setDescription(`Hey ${member}, welcome to the community! Check the rules and have fun.`).setThumbnail(member.user.displayAvatarURL({ size: 256 })).setFooter({ text: 'Run /help to see what I can do.' });
    await channel.send({ embeds: [welcome], allowedMentions: { users: [member.id] } }).catch(console.error);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const now = Date.now();
  const previous = recentMessages.get(message.author.id) ?? [];
  const recent = previous.filter((timestamp) => now - timestamp < 10000);
  recent.push(now);
  recentMessages.set(message.author.id, recent);
  if (recent.length < 6 || message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
  const lastAction = spamCooldowns.get(message.author.id) ?? 0;
  if (now - lastAction < 60_000) return;
  spamCooldowns.set(message.author.id, now);
  if (message.member.moderatable) {
    await message.member.timeout(60_000, 'Automatic spam protection').catch(() => {});
    await message.channel.send(`${message.author}, please slow down. You have been timed out for 1 minute.`).catch(() => {});
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const guildOnly = ['setup', 'serverinfo', 'userinfo', 'poll', 'announce', 'clear', 'kick', 'ban'];
  if (guildOnly.includes(interaction.commandName) && !interaction.guild) {
    await interaction.reply({ content: 'This command can only be used inside a server.', ephemeral: true });
    return;
  }

  if (interaction.commandName === 'ping') {
    await interaction.reply(`Pong! API latency is ${client.ws.ping}ms.`);
  } else if (interaction.commandName === 'help') {
    await interaction.reply({ embeds: [commandHelp], ephemeral: true });
  } else if (interaction.commandName === 'setup') {
    await interaction.reply({ embeds: [setupEmbed()], ephemeral: true });
  } else if (interaction.commandName === 'serverinfo') {
    const owner = await interaction.guild.fetchOwner().catch(() => null);
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`${interaction.guild.name} — server info`).setThumbnail(interaction.guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'Members', value: `${interaction.guild.memberCount}`, inline: true },
        { name: 'Channels', value: `${interaction.guild.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${interaction.guild.roles.cache.size}`, inline: true },
        { name: 'Owner', value: owner?.user.tag ?? 'Unavailable', inline: true },
        { name: 'Created', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Server ID', value: interaction.guild.id, inline: true },
        { name: 'Boosts', value: `${interaction.guild.premiumSubscriptionCount ?? 0} (level ${interaction.guild.premiumTier})`, inline: true },
        { name: 'Verification', value: `${interaction.guild.verificationLevel}`, inline: true },
      );
    await interaction.reply({ embeds: [embed] });
  } else if (interaction.commandName === 'userinfo') {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const roles = member?.roles.cache.filter((role) => role.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map((role) => role.name).slice(0, 8);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`${user.tag} — user info`).setThumbnail(user.displayAvatarURL({ size: 256 })).addFields(
      { name: 'User ID', value: user.id, inline: true },
      { name: 'Joined server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
      { name: 'Account created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Roles', value: roles?.length ? roles.map((role) => `@${role}`).join(', ').slice(0, 1024) : 'No extra roles', inline: false },
    ).setFooter({ text: `Requested by ${interaction.user.tag}` })] });
  } else if (interaction.commandName === 'avatar') {
    const user = interaction.options.getUser('user') ?? interaction.user;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`${user.tag}'s avatar`).setImage(user.displayAvatarURL({ size: 1024, extension: 'png' }))] });
  } else if (interaction.commandName === 'poll') {
    const question = interaction.options.getString('question', true).trim();
    const choices = ['option1', 'option2', 'option3', 'option4'].map((name) => interaction.options.getString(name)?.trim()).filter(Boolean);
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    if (new Set(choices.map((choice) => choice.toLowerCase())).size !== choices.length) return interaction.reply({ content: 'Poll choices must be different.', ephemeral: true });
    const description = choices.map((choice, index) => `${emojis[index]} **${choice}**`).join('\n');
    const pollEmbed = new EmbedBuilder().setColor(0xfee75c).setTitle('📊 Community Poll').setDescription(`**${question}**\n\n${description}`).setFooter({ text: `Created by ${interaction.user.tag} • React to vote` });
    const poll = await interaction.reply({ embeds: [pollEmbed], fetchReply: true, allowedMentions: { parse: [] } });
    for (const emoji of emojis.slice(0, choices.length)) await poll.react(emoji);
  } else if (interaction.commandName === 'announce') {
    const message = interaction.options.getString('message', true).trim();
    const title = interaction.options.getString('title')?.trim() || '📢 Announcement';
    const announcement = new EmbedBuilder().setColor(0xed4245).setTitle(title).setDescription(message).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ size: 128 }) }).setTimestamp().setFooter({ text: `${interaction.guild.name} • Official announcement` });
    await interaction.reply({ embeds: [announcement], allowedMentions: { parse: [] } });
  } else if (interaction.commandName === 'clear') {
    const amount = interaction.options.getInteger('amount', true);
    if (!interaction.channel?.isTextBased() || !('bulkDelete' in interaction.channel)) return interaction.reply({ content: 'This command needs a text channel.', ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `Deleted ${deleted.size} message${deleted.size === 1 ? '' : 's'}.`, ephemeral: true });
  } else if (interaction.commandName === 'kick' || interaction.commandName === 'ban') {
    const user = interaction.options.getUser('user', true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const reason = interaction.options.getString('reason') ?? `Action by ${interaction.user.tag}`;
    if (!member) return interaction.reply({ content: 'That member is not in this server.', ephemeral: true });
    if (user.id === interaction.user.id || user.id === interaction.guild.ownerId || user.id === interaction.guild.members.me?.id) return interaction.reply({ content: 'I cannot moderate that account.', ephemeral: true });
    if (!member.moderatable && interaction.commandName === 'kick') return interaction.reply({ content: 'I cannot kick that member. Check role hierarchy and permissions.', ephemeral: true });
    if (!member.bannable && interaction.commandName === 'ban') return interaction.reply({ content: 'I cannot ban that member. Check role hierarchy and permissions.', ephemeral: true });
    if (interaction.commandName === 'kick') await member.kick(reason);
    else await member.ban({ reason });
    await interaction.reply(`${interaction.commandName === 'kick' ? 'Kicked' : 'Banned'} **${user.tag}**. Reason: ${reason}`);
  }
});

client.on('error', (error) => console.error('Discord client error:', error));
process.on('unhandledRejection', (error) => console.error('Unhandled promise rejection:', error));
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('Could not log in. Check DISCORD_TOKEN and bot settings:', error.message);
  process.exit(1);
});
