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
  if (!process.env[name]?.trim()) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const snowflake = /^\d{17,20}$/;
for (const name of ['CLIENT_ID', 'GUILD_ID']) {
  if (process.env[name]?.trim() && !snowflake.test(process.env[name].trim())) {
    console.error(`${name} must be a Discord ID made only of numbers. Copy it from Developer Mode / Developer Portal; do not put the bot token there.`);
    process.exit(1);
  }
}

const log = (level, message, details = '') => {
  const suffix = details ? ` ${details}` : '';
  console[level](`[${new Date().toISOString()}] ${message}${suffix}`);
};
const cleanText = (value, fallback = 'No reason provided.') => String(value || fallback).trim().slice(0, 512);

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check bot health, latency, and uptime.'),
  new SlashCommandBuilder().setName('status').setDescription('Check hosting, Discord connection, and bot status.'),
  new SlashCommandBuilder().setName('membercount').setDescription('Show a clean member count for this server.'),
  new SlashCommandBuilder().setName('channelcount').setDescription('Show members in this server and people currently in voice channels.'),
  new SlashCommandBuilder().setName('servericon').setDescription('Show this server icon in full size.'),
  new SlashCommandBuilder().setName('invite').setDescription('Get a safe invite link for this bot.'),
  new SlashCommandBuilder().setName('permissions').setDescription('Check the bot permissions in this channel.'),
  new SlashCommandBuilder().setName('botinfo').setDescription('Show information about this bot and its features.'),
  new SlashCommandBuilder().setName('serverroles').setDescription('List the most important roles in this server.'),
  new SlashCommandBuilder().setName('roll').setDescription('Roll a dice.').addIntegerOption((option) => option.setName('sides').setDescription('Number of sides, from 2 to 1000.').setMinValue(2).setMaxValue(1000)),
  new SlashCommandBuilder().setName('coinflip').setDescription('Flip a coin.'),
  new SlashCommandBuilder().setName('8ball').setDescription('Ask the magic 8-ball a question.').addStringOption((option) => option.setName('question').setDescription('Your question.').setMaxLength(250).setRequired(true)),
  new SlashCommandBuilder().setName('choose').setDescription('Choose randomly between options.').addStringOption((option) => option.setName('options').setDescription('Separate choices with commas.').setMaxLength(1000).setRequired(true)),
  new SlashCommandBuilder().setName('rps').setDescription('Play rock, paper, scissors against the bot.').addStringOption((option) => option.setName('choice').setDescription('Your move.').setRequired(true).addChoices({ name: 'Rock 🪨', value: 'rock' }, { name: 'Paper 📄', value: 'paper' }, { name: 'Scissors ✂️', value: 'scissors' })),
  new SlashCommandBuilder().setName('ship').setDescription('Calculate the friendship score for two users.').addUserOption((option) => option.setName('user1').setDescription('First user.').setRequired(true)).addUserOption((option) => option.setName('user2').setDescription('Second user.').setRequired(true)),
  new SlashCommandBuilder().setName('roast').setDescription('Give a playful, harmless roast.').addUserOption((option) => option.setName('user').setDescription('User to roast.')),
  new SlashCommandBuilder().setName('fact').setDescription('Get a random gaming and community fact.'),
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
  log('log', `Registered ${commands.length} slash commands${process.env.GUILD_ID ? ' for the configured guild' : ' globally'}.`);
} catch (error) {
  log('error', 'Could not register slash commands:', error.message);
  log('error', 'Check CLIENT_ID: it must be the numeric Application ID, not the bot token.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const recentMessages = new Map();
const spamCooldowns = new Map();
const commandCooldowns = new Map();
const maintenance = setInterval(() => {
  const cutoff = Date.now() - 10 * 60_000;
  for (const [key, timestamps] of recentMessages) {
    const fresh = timestamps.filter((timestamp) => timestamp > cutoff);
    if (fresh.length) recentMessages.set(key, fresh);
    else recentMessages.delete(key);
  }
  for (const [key, timestamp] of commandCooldowns) if (timestamp < Date.now()) commandCooldowns.delete(key);
  for (const [key, timestamp] of spamCooldowns) if (timestamp < cutoff) spamCooldowns.delete(key);
}, 60_000);
const commandList = '/ping, /help, /setup, /status, /membercount, /channelcount, /servericon, /invite, /permissions, /botinfo, /serverroles, /serverinfo, /userinfo, /avatar, /roll, /coinflip, /8ball, /choose, /rps, /ship, /roast, /fact, /poll, /announce, /clear, /kick, /ban';
const eightBallAnswers = ['Absolutely yes.', 'Probably yes.', 'It is looking good.', 'Ask again later.', 'I am not sure yet.', 'Probably not.', 'The signs say no.', 'Absolutely not.'];
const facts = ['The first video game easter egg is commonly credited to Adventure for the Atari 2600.', 'Discord was originally built for people who wanted an easier way to talk while gaming.', 'A good community grows faster when new players get a friendly welcome.', 'The best moderation tool is clear rules applied consistently.', 'Taking short breaks can make long gaming sessions more fun.'];
const roasts = ['has the confidence of a final boss and the strategy of a tutorial bot.', 'could lose a game of rock paper scissors to a loading screen.', 'is proof that having a plan and following it are two different skills.', 'brings main-character energy to every side quest.', 'is not lagging; the brain is just buffering.'];
const moves = { rock: '🪨', paper: '📄', scissors: '✂️' };
const errorEmbed = (code = 'UNKNOWN') => new EmbedBuilder()
  .setColor(0xed4245)
  .setTitle('⚠️ Something went wrong')
  .setDescription('The command could not finish. Your server and account are safe — please try again in a moment.')
  .addFields(
    { name: 'Error code', value: `\`${code}\``, inline: true },
    { name: 'What to check', value: 'Check the bot hosting logs, Discord status, and bot permissions in this channel.' },
    { name: 'Need more help?', value: 'Run `/status`, then check the hosting dashboard or terminal. Never share your bot token.' },
  )
  .setFooter({ text: 'Free Community Bot • Friendly error reporting' })
  .setTimestamp();
const commandHelp = new EmbedBuilder()
  .setColor(0x5865f2)
  .setTitle('Free Community Bot')
  .setDescription('Helpful tools for your server. Use a command below to get started.')
  .addFields(
    { name: '📌 General', value: '`/ping` health • `/status` hosting status • `/membercount` members • `/serverinfo` server details • `/servericon` server icon • `/userinfo` member details • `/avatar` profile picture' },
    { name: '🔗 Tools', value: '`/invite` bot invite link • `/permissions` channel permission check • `/botinfo` bot details • `/serverroles` role overview' },
    { name: '🎮 Fun & Games', value: '`/roll` dice • `/coinflip` coin • `/8ball` answer • `/choose` random choice • `/rps` battle • `/ship` friendship score • `/roast` playful roast • `/fact` fun fact • `/poll` poll' },
    { name: '📣 Community', value: '`/announce` post a polished announcement' },
    { name: '🛡️ Moderation', value: '`/clear` remove messages • `/kick` remove a member • `/ban` ban a member' },
    { name: '⚙️ Setup', value: '`/setup` shows the complete administrator setup guide' },
  )
  .setFooter({ text: 'Free to use • Keep the bot token private' });
const totalMembers = () => client.guilds.cache.reduce((total, guild) => total + (guild.memberCount ?? 0), 0);
const presenceTimer = null;
const updatePresence = () => {
  if (!client.user) return;
  client.user.setPresence({ activities: [{ name: `${totalMembers().toLocaleString()} members • /help` }], status: 'online' });
};
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
  updatePresence();
  log('log', `Logged in as ${readyClient.user.tag} in ${readyClient.guilds.cache.size} server(s), serving ${totalMembers().toLocaleString()} members.`);
});

client.on('guildCreate', updatePresence);
client.on('guildDelete', updatePresence);
client.on('guildMemberAdd', async (member) => {
  updatePresence();
  if (!process.env.WELCOME_CHANNEL_ID) return;
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (channel?.isTextBased()) {
    const welcome = new EmbedBuilder().setColor(0x57f287).setTitle(`Welcome to ${member.guild.name}!`).setDescription(`Hey ${member}, welcome to the community! Check the rules and have fun.`).setThumbnail(member.user.displayAvatarURL({ size: 256 })).setFooter({ text: 'Run /help to see what I can do.' });
    await channel.send({ embeds: [welcome], allowedMentions: { users: [member.id] } }).catch((error) => log('error', 'Welcome message failed:', error.message));
  }
});

client.on('guildMemberRemove', updatePresence);
const presenceTimerHandle = setInterval(updatePresence, 5 * 60_000);

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const now = Date.now();
  const spamKey = `${message.guild.id}:${message.author.id}`;
  const previous = recentMessages.get(spamKey) ?? [];
  const recent = previous.filter((timestamp) => now - timestamp < 10000);
  recent.push(now);
  recentMessages.set(spamKey, recent);
  if (recent.length < 6 || message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
  const lastAction = spamCooldowns.get(spamKey) ?? 0;
  if (now - lastAction < 60_000) return;
  spamCooldowns.set(spamKey, now);
  if (message.member.moderatable) {
    await message.member.timeout(60_000, 'Automatic spam protection').catch(() => {});
    await message.channel.send({ content: `${message.author}, please slow down. You have been timed out for 1 minute.`, allowedMentions: { users: [message.author.id] } }).catch(() => {});
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cooldownKey = `${interaction.user.id}:${interaction.commandName}`;
  const now = Date.now();
  const cooldownUntil = commandCooldowns.get(cooldownKey) ?? 0;
  if (cooldownUntil > now) {
    const seconds = Math.ceil((cooldownUntil - now) / 1000);
    await interaction.reply({ content: `Please wait ${seconds}s before using \`/${interaction.commandName}\` again.`, ephemeral: true });
    return;
  }
  commandCooldowns.set(cooldownKey, now + (['roll', 'coinflip', '8ball', 'choose', 'rps', 'ship', 'roast', 'fact'].includes(interaction.commandName) ? 1500 : 750));
  const guildOnly = ['setup', 'membercount', 'channelcount', 'servericon', 'permissions', 'serverroles', 'serverinfo', 'userinfo', 'poll', 'announce', 'clear', 'kick', 'ban'];
  if (guildOnly.includes(interaction.commandName) && !interaction.guild) {
    await interaction.reply({ content: 'This command can only be used inside a server.', ephemeral: true });
    return;
  }

  try {
    if (interaction.commandName === 'membercount') {
    const humans = interaction.guild?.members.cache.filter((member) => !member.user.bot).size;
    const bots = interaction.guild?.members.cache.filter((member) => member.user.bot).size;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle(`👥 ${interaction.guild.name} member count`).setDescription(`This server has **${interaction.guild.memberCount}** members.`).addFields(
      { name: 'People', value: `${humans ?? 'Unavailable'}`, inline: true },
      { name: 'Bots', value: `${bots ?? 'Unavailable'}`, inline: true },
      { name: 'Server ID', value: interaction.guild.id, inline: true },
    ).setFooter({ text: 'Counts use the members available to the bot' })] });
  } else if (interaction.commandName === 'channelcount') {
    const voiceChannels = interaction.guild.channels.cache.filter((channel) => channel.isVoiceBased());
    const activeVoiceMembers = voiceChannels.reduce((total, channel) => total + channel.members.size, 0);
    const textChannels = interaction.guild.channels.cache.filter((channel) => channel.isTextBased()).size;
    const voiceChannelList = voiceChannels.filter((channel) => channel.members.size > 0).map((channel) => `${channel.name}: ${channel.members.size}`).join('\n').slice(0, 900) || 'Nobody is in a voice channel right now.';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`📊 ${interaction.guild.name} live counts`).addFields(
      { name: 'Total server members', value: `${interaction.guild.memberCount}`, inline: true },
      { name: 'Currently in voice', value: `${activeVoiceMembers}`, inline: true },
      { name: 'Text channels', value: `${textChannels}`, inline: true },
      { name: 'Voice channels', value: `${voiceChannels.size}`, inline: true },
      { name: 'Active voice rooms', value: voiceChannelList, inline: false },
    ).setFooter({ text: 'Voice counts are live when the command runs' }).setTimestamp()] });
  } else if (interaction.commandName === 'servericon') {
    const icon = interaction.guild.iconURL({ size: 4096, extension: 'png' });
    if (!icon) return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle('🖼️ No server icon').setDescription('This server has not set a custom icon yet.')], ephemeral: true });
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`${interaction.guild.name} icon`).setImage(icon).setURL(icon).setFooter({ text: 'Click the title to open the full-size image' })] });
  } else if (interaction.commandName === 'invite') {
    const permissions = PermissionFlagsBits.ViewChannel | PermissionFlagsBits.SendMessages | PermissionFlagsBits.EmbedLinks | PermissionFlagsBits.AddReactions | PermissionFlagsBits.ManageMessages | PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers | PermissionFlagsBits.ModerateMembers | PermissionFlagsBits.ManageGuild;
    const invite = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=${permissions.toString()}`;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('🔗 Invite this bot').setDescription(`[Click here to invite me to another server](${invite})`).addFields({ name: 'Safety note', value: 'Review the permissions before authorizing. Never share your bot token.' }).setFooter({ text: 'Free community bot' })], ephemeral: true });
  } else if (interaction.commandName === 'permissions') {
    const me = interaction.guild.members.me;
    const permissions = interaction.channel.permissionsFor(me);
    const needed = ['ViewChannel', 'SendMessages', 'EmbedLinks', 'AddReactions', 'ManageMessages', 'KickMembers', 'BanMembers', 'ModerateMembers'];
    const lines = needed.map((name) => `${permissions?.has(PermissionFlagsBits[name]) ? '✅' : '❌'} ${name}`).join('\n');
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(permissions?.has(PermissionFlagsBits.SendMessages) ? 0x57f287 : 0xed4245).setTitle('🔐 Channel permissions').setDescription(lines).addFields({ name: 'How to fix', value: 'Ask an administrator to update the bot role or this channel override. The bot role must also be above members it moderates.' })], ephemeral: true });
  } else if (interaction.commandName === 'botinfo') {
    const uptime = Math.floor(process.uptime());
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('🤖 Free Community Bot').setDescription('A friendly, privacy-conscious bot for gaming and community servers.').setThumbnail(client.user.displayAvatarURL({ size: 256 })).addFields(
      { name: 'Version', value: '1.1.0', inline: true },
      { name: 'Commands', value: `${commands.length}`, inline: true },
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Uptime', value: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`, inline: true },
      { name: 'Source', value: '[Open source on GitHub](https://github.com/ollyjaxk-byte/discord-community-bot)', inline: true },
      { name: 'License', value: 'MIT • Free to use', inline: true },
    ).setFooter({ text: 'Run /help to explore every command' })] });
  } else if (interaction.commandName === 'serverroles') {
    const roles = interaction.guild.roles.cache.sort((a, b) => b.position - a.position).filter((role) => role.id !== interaction.guild.id).first(15);
    const roleText = roles.length ? roles.map((role) => `${role.mention} • ${role.members.size} member${role.members.size === 1 ? '' : 's'}`).join('\n').slice(0, 4000) : 'No custom roles found.';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle(`🎭 ${interaction.guild.name} roles`).setDescription(roleText).setFooter({ text: 'Showing the 15 highest roles' })] });
  } else if (interaction.commandName === 'ping') {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const status = client.ws.ping < 150 ? 'Excellent' : client.ws.ping < 300 ? 'Good' : 'Slow';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(client.ws.ping < 300 ? 0x57f287 : 0xfee75c).setTitle('🏓 Bot health').addFields(
      { name: 'API latency', value: `${client.ws.ping}ms`, inline: true },
      { name: 'Status', value: status, inline: true },
      { name: 'Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Node.js', value: process.version, inline: true },
    ).setFooter({ text: 'Healthy and ready to help' })] });
  } else if (interaction.commandName === 'status') {
    const uptime = Math.floor(process.uptime());
    const connected = client.ws.status === 0;
    const memory = Math.round(process.memoryUsage().rss / 1024 / 1024);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(connected && client.ws.ping < 500 ? 0x57f287 : 0xed4245).setTitle(connected ? '✅ Bot status: online' : '❌ Bot status: connection problem').setDescription(connected ? 'The bot process is running and connected to Discord.' : 'The process is running, but the Discord connection needs attention.').addFields(
      { name: 'Discord connection', value: connected ? 'Connected' : 'Disconnected', inline: true },
      { name: 'Latency', value: `${client.ws.ping}ms`, inline: true },
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Uptime', value: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`, inline: true },
      { name: 'Memory', value: `${memory} MB`, inline: true },
      { name: 'Next step', value: connected ? 'Commands should work. If one fails, use its error code.' : 'Check hosting logs and Discord Developer Portal status.', inline: false },
    ).setFooter({ text: 'Status is measured by this bot process' }).setTimestamp()] });
  } else if (interaction.commandName === 'roll') {
    const sides = interaction.options.getInteger('sides') ?? 6;
    const result = Math.floor(Math.random() * sides) + 1;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('🎲 Dice roll').setDescription(`You rolled **${result}** on a **d${sides}**.`).setFooter({ text: `Rolled by ${interaction.user.tag}` })] });
  } else if (interaction.commandName === 'coinflip') {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setTitle('🪙 Coin flip').setDescription(`The coin landed on **${result}**!`).setFooter({ text: `Flipped by ${interaction.user.tag}` })] });
  } else if (interaction.commandName === '8ball') {
    const question = interaction.options.getString('question', true).trim();
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x9b59b6).setTitle('🎱 Magic 8-ball').addFields({ name: 'Question', value: question }, { name: 'Answer', value: `**${eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)]}**` }).setFooter({ text: `Asked by ${interaction.user.tag}` })] });
  } else if (interaction.commandName === 'choose') {
    const options = interaction.options.getString('options', true).split(',').map((option) => option.trim()).filter(Boolean);
    if (options.length < 2) return interaction.reply({ content: 'Give me at least two choices separated by commas. Example: `pizza, tacos, burgers`.', ephemeral: true });
    if (new Set(options.map((option) => option.toLowerCase())).size !== options.length) return interaction.reply({ content: 'Please use different choices.', ephemeral: true });
    const choice = options[Math.floor(Math.random() * options.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('✨ Random choice').setDescription(`I choose **${choice}**!`).addFields({ name: 'Choices', value: options.map((option, index) => `${index + 1}. ${option}`).join('\n').slice(0, 1024) }).setFooter({ text: `Chosen for ${interaction.user.tag}` })] });
  } else if (interaction.commandName === 'rps') {
    const player = interaction.options.getString('choice', true);
    const bot = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
    const winner = player === bot ? 'It is a draw!' : ((player === 'rock' && bot === 'scissors') || (player === 'paper' && bot === 'rock') || (player === 'scissors' && bot === 'paper') ? 'You win! 🎉' : 'I win! 🤖');
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(winner.startsWith('You') ? 0x57f287 : winner.startsWith('I') ? 0xed4245 : 0xfee75c).setTitle('⚔️ Rock, Paper, Scissors').setDescription(`You chose **${moves[player]} ${player}**\nI chose **${moves[bot]} ${bot}**\n\n## ${winner}`).setFooter({ text: `Battle played by ${interaction.user.tag}` })] });
  } else if (interaction.commandName === 'ship') {
    const user1 = interaction.options.getUser('user1', true);
    const user2 = interaction.options.getUser('user2', true);
    const seed = [...`${user1.id}${user2.id}`].reduce((total, char) => total + char.charCodeAt(0), 0);
    const score = seed % 101;
    const label = score >= 80 ? 'Legendary duo 💖' : score >= 60 ? 'Great team 💫' : score >= 40 ? 'Could work 🤝' : 'Chaotic pairing ⚡';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff73fa).setTitle('💞 Friendship scanner').setDescription(`**${user1.username}** + **${user2.username}**\n\n# ${score}%\n${label}`).setFooter({ text: 'For fun only • No friendship guarantees' })] });
  } else if (interaction.commandName === 'roast') {
    const user = interaction.options.getUser('user') ?? interaction.user;
    if (user.id === client.user.id) return interaction.reply('I am already self-aware enough, thanks. 🤖');
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff9f43).setTitle('🔥 Playful roast').setDescription(`${user}, you ${roast}`).setFooter({ text: 'Just jokes • Keep it friendly' })], allowedMentions: { users: [user.id] } });
  } else if (interaction.commandName === 'fact') {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x3498db).setTitle('💡 Community fact').setDescription(facts[Math.floor(Math.random() * facts.length)]).setFooter({ text: 'Learn, play, and be kind' })] });
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
    const message = cleanText(interaction.options.getString('message'), 'No announcement text provided.');
    const title = cleanText(interaction.options.getString('title'), '📢 Announcement').slice(0, 100);
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
    const reason = cleanText(interaction.options.getString('reason'), `Action by ${interaction.user.tag}`);
    if (!member) return interaction.reply({ content: 'That member is not in this server.', ephemeral: true });
    if (user.id === interaction.user.id || user.id === interaction.guild.ownerId || user.id === interaction.guild.members.me?.id) return interaction.reply({ content: 'I cannot moderate that account.', ephemeral: true });
    if (!member.moderatable && interaction.commandName === 'kick') return interaction.reply({ content: 'I cannot kick that member. Check role hierarchy and permissions.', ephemeral: true });
    if (!member.bannable && interaction.commandName === 'ban') return interaction.reply({ content: 'I cannot ban that member. Check role hierarchy and permissions.', ephemeral: true });
    if (interaction.commandName === 'kick') await member.kick(reason);
    else await member.ban({ reason });
    await interaction.reply(`${interaction.commandName === 'kick' ? 'Kicked' : 'Banned'} **${user.tag}**. Reason: ${reason}`);
    }
  } catch (error) {
    const errorCode = `${interaction.commandName.toUpperCase().slice(0, 8)}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    log('error', `[${errorCode}] Command ${interaction.commandName} failed:`, error.message);
    const response = { embeds: [errorEmbed(errorCode)], ephemeral: true, allowedMentions: { parse: [] } };
    if (interaction.replied || interaction.deferred) await interaction.followUp(response).catch(() => {});
    else await interaction.reply(response).catch(() => {});
  }
});

client.on('warn', (message) => log('warn', 'Discord warning:', message));
client.on('rateLimit', (rateLimitData) => log('warn', 'Discord rate limit reached:', JSON.stringify({ timeout: rateLimitData.timeout, route: rateLimitData.route, method: rateLimitData.method })));
client.on('error', (error) => log('error', 'Discord client error:', error.message));
process.on('unhandledRejection', (error) => log('error', 'Unhandled promise rejection:', error instanceof Error ? error.message : String(error)));
process.on('uncaughtException', (error) => { log('error', 'Uncaught exception:', error.message); process.exitCode = 1; });
const shutdown = (signal) => { clearInterval(maintenance); clearInterval(presenceTimerHandle); client.destroy(); log('log', `Bot stopped cleanly (${signal}).`); process.exit(0); };
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  log('error', 'Could not log in. Check DISCORD_TOKEN and bot settings:', error.message);
  process.exit(1);
});
