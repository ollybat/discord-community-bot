import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, EmbedBuilder, StringSelectMenuBuilder,
  GatewayIntentBits, PermissionFlagsBits, REST, Routes, SlashCommandBuilder,
} from 'discord.js';

const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
for (const name of required) if (!process.env[name]?.trim()) { console.error(`Missing required environment variable: ${name}`); process.exit(1); }
const snowflake = /^\d+$/;
for (const name of ['CLIENT_ID', 'GUILD_ID']) if (process.env[name]?.trim() && !snowflake.test(process.env[name].trim())) { console.error(`${name} must contain only the numeric Discord ID.`); process.exit(1); }

const dataDir = path.resolve(process.env.DATA_DIR ?? './data');
const configFile = path.join(dataDir, 'guild-config.json');
const knowledgeFile = path.join(dataDir, 'bot-knowledge.json');
const ensureStore = async (file) => { await fs.mkdir(dataDir, { recursive: true }); try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { await fs.writeFile(file, '{}'); return {}; } };
let configs = await ensureStore(configFile);
let knowledge = await ensureStore(knowledgeFile);
const save = async (file, value) => { await fs.mkdir(dataDir, { recursive: true }); await fs.writeFile(file, JSON.stringify(value, null, 2)); };
const clean = (value, fallback = '') => String(value ?? fallback).trim().slice(0, 1900);
const admin = (command) => command.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const setup = new SlashCommandBuilder().setName('setup').setDescription('Configure the server bot').addSubcommand((s) => s.setName('welcomer').setDescription('Set welcome and channel locations').addChannelOption((o) => o.setName('welcome_channel').setDescription('Welcome messages').addChannelTypes(ChannelType.GuildText).setRequired(true)).addChannelOption((o) => o.setName('bot_commands_channel').setDescription('Bot commands').addChannelTypes(ChannelType.GuildText).setRequired(true)).addChannelOption((o) => o.setName('shop_channel').setDescription('Free bot shop').addChannelTypes(ChannelType.GuildText).setRequired(true)).addChannelOption((o) => o.setName('verify_channel').setDescription('Verification').addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand((s) => s.setName('tickets').setDescription('Configure tickets and inactivity closing').addChannelOption((o) => o.setName('panel_channel').setDescription('Ticket panel channel').addChannelTypes(ChannelType.GuildText).setRequired(true)).addChannelOption((o) => o.setName('logs_channel').setDescription('Ticket logs').addChannelTypes(ChannelType.GuildText).setRequired(true)).addChannelOption((o) => o.setName('category').setDescription('Ticket category').addChannelTypes(ChannelType.GuildCategory).setRequired(true)).addIntegerOption((o) => o.setName('inactivity_hours').setDescription('Close after 1–24 inactive hours').setMinValue(1).setMaxValue(24).setRequired(true)));
const commands = [
  setup,
  admin(new SlashCommandBuilder().setName('setuproles').setDescription('Set owner, co-owner, and admin roles').addRoleOption((o) => o.setName('owner_role').setDescription('Owner role').setRequired(true)).addRoleOption((o) => o.setName('co_owner_role').setDescription('Co-owner role').setRequired(true)).addRoleOption((o) => o.setName('admin_role').setDescription('Admin role').setRequired(true))),
  admin(new SlashCommandBuilder().setName('setupserver').setDescription('Create the standard shop, verification, commands, and ticket channels')),
  new SlashCommandBuilder().setName('ticket').setDescription('Open a private support ticket'),
  new SlashCommandBuilder().setName('ask').setDescription('Ask the bot about one of the bot guides').addStringOption((o) => o.setName('question').setDescription('What do you need help setting up?').setMaxLength(500).setRequired(true)),
  admin(new SlashCommandBuilder().setName('knowledge').setDescription('Manage bot setup guides').addSubcommand((s) => s.setName('add').setDescription('Add a bot guide').addStringOption((o) => o.setName('title').setDescription('Bot or guide name').setMaxLength(100).setRequired(true)).addStringOption((o) => o.setName('content').setDescription('Setup information').setMaxLength(1800).setRequired(true))).addSubcommand((s) => s.setName('list').setDescription('List saved guides')).addSubcommand((s) => s.setName('remove').setDescription('Remove a guide').addStringOption((o) => o.setName('title').setDescription('Guide title').setRequired(true)))),
  new SlashCommandBuilder().setName('ping').setDescription('Check bot health'),
].map((c) => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
try {
  await rest.put(process.env.GUILD_ID ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID) : Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  console.log('Registered ' + commands.length + ' slash commands' + (process.env.GUILD_ID ? ' for the configured guild.' : ' globally.'));
} catch (error) {
  console.error('Slash-command registration failed:', error.message);
  if (error.code === 50001 && process.env.GUILD_ID) {
    console.error('Discord returned Missing Access. Make sure this bot is installed in GUILD_ID with the applications.commands scope, or remove GUILD_ID to register globally.');
  } else {
    console.error('Check CLIENT_ID, DISCORD_TOKEN, and Discord Developer Portal permissions.');
  }
  console.error('Continuing to connect to Discord; the bot can still run, but slash commands will appear after registration succeeds.');
}
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const guildConfig = (id) => configs[id] ??= { welcome: {}, roles: {}, tickets: {}, openTickets: {} };
const channelMention = (id) => id ? `<#${id}>` : 'not set';
const ticketEmbed = () => new EmbedBuilder().setColor(0x5865f2).setTitle('🎫 Need help?').setDescription('Click **Open ticket** to create a private support channel. Please explain what you need help setting up. Tickets with no messages for the configured inactivity period close automatically.').setFooter({ text: 'Free community support' });
const panelRow = () => [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('open_ticket').setLabel('Open ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary)), new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('ticket_type').setPlaceholder('Choose a support category').addOptions({ label: 'Bot setup help', value: 'setup', emoji: '🛠️' }, { label: 'Bug report', value: 'bug', emoji: '🐛' }, { label: 'Bot request', value: 'request', emoji: '🤖' }, { label: 'General support', value: 'general', emoji: '💬' }) )];

async function createStandardChannels(guild) {
  const wanted = [['welcome', 'welcome'], ['bot-commands', 'botCommands'], ['bot-shop', 'shop'], ['verify', 'verify'], ['tickets', 'ticketPanel'], ['ticket-logs', 'logs']];
  const result = {};
  for (const [name, key] of wanted) { let channel = guild.channels.cache.find((c) => c.type === ChannelType.GuildText && c.name === name); if (!channel) channel = await guild.channels.create({ name, type: ChannelType.GuildText, reason: 'Free bot server setup' }); result[key] = channel.id; }
  let category = guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name === 'Support Tickets');
  if (!category) category = await guild.channels.create({ name: 'Support Tickets', type: ChannelType.GuildCategory, reason: 'Free bot ticket setup' });
  result.category = category.id;
  return result;
}
async function openTicket(guild, user) {
  const cfg = guildConfig(guild.id); const ticketCfg = cfg.tickets;
  if (!ticketCfg.category) throw new Error('Tickets are not configured. An administrator must run `/setup tickets` first.');
  if (cfg.openTickets[user.id]) return guild.channels.cache.get(cfg.openTickets[user.id]);
  const safe = user.username.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 18) || 'user';
  const channel = await guild.channels.create({ name: `ticket-${safe}`, type: ChannelType.GuildText, parent: ticketCfg.category, permissionOverwrites: [{ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }, { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] }], reason: 'Support ticket opened' });
  cfg.openTickets[user.id] = channel.id; cfg.tickets.activity ??= {}; cfg.tickets.activity[channel.id] = Date.now(); await save(configFile, configs);
  await channel.send({ content: `${user}`, embeds: [new EmbedBuilder().setColor(0x57f287).setTitle('Support ticket').setDescription('Describe your question. A staff member will help you. Use **Close ticket** when finished.').setFooter({ text: `Auto-close after ${ticketCfg.inactivityHours} hour(s) without a message` })], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('Close ticket').setStyle(ButtonStyle.Danger))], allowedMentions: { users: [user.id] } });
  return channel;
}
async function closeTicket(channel, reason = 'inactivity') { for (const cfg of Object.values(configs)) { const owner = Object.entries(cfg.openTickets ?? {}).find(([, id]) => id === channel.id)?.[0]; if (!owner) continue; delete cfg.openTickets[owner]; delete cfg.tickets.activity[channel.id]; await save(configFile, configs); const logChannel = channel.guild.channels.cache.get(cfg.tickets.logs); if (logChannel?.isTextBased()) await logChannel.send(`🗃️ Closed ${channel} — ${reason}.`).catch(() => {}); await channel.delete(`Ticket closed: ${reason}`).catch(() => {}); return; } }

client.once('clientReady', (bot) => {
  console.log(`Logged in as ${bot.user.tag} in ${client.guilds.cache.size} server(s).`);
  if (client.guilds.cache.size === 0) console.error('The bot is online but is not installed in any server. Re-invite it with both bot and applications.commands scopes, then restart Railway.');
});
client.on('guildMemberAdd', async (member) => { const id = guildConfig(member.guild.id).welcome.welcomeChannel; const channel = member.guild.channels.cache.get(id); if (channel?.isTextBased()) await channel.send({ content: `Welcome ${member} to **${member.guild.name}**! Check the rules and visit the bot shop.`, allowedMentions: { users: [member.id] } }).catch(() => {}); });
client.on('messageCreate', async (message) => { if (message.author.bot || !message.guild) return; const cfg = configs[message.guild.id]; if (cfg?.tickets?.activity?.[message.channel.id]) { cfg.tickets.activity[message.channel.id] = Date.now(); await save(configFile, configs); } });
setInterval(async () => { const now = Date.now(); for (const cfg of Object.values(configs)) { const hours = Number(cfg.tickets?.inactivityHours); if (!hours) continue; for (const [channelId, last] of Object.entries(cfg.tickets.activity ?? {})) if (now - last >= hours * 3600000) { const channel = client.channels.cache.get(channelId); if (channel) await closeTicket(channel, `${hours} hour(s) of inactivity`); } } }, 10 * 60 * 1000);

client.on('interactionCreate', async (i) => {
  if (i.isStringSelectMenu() && i.customId === 'ticket_type') { try { const channel = await openTicket(i.guild, i.user); await i.reply({ content: `Your ${i.values[0]} ticket is ready: ${channel}`, flags: 64 }); } catch (e) { await i.reply({ content: e.message, flags: 64 }); } return; }
  if (i.isButton()) { if (i.customId === 'open_ticket') { try { const channel = await openTicket(i.guild, i.user); await i.reply({ content: channel ? `Your ticket is ready: ${channel}` : 'Unable to open a ticket.', flags: 64 }); } catch (e) { await i.reply({ content: e.message, flags: 64 }); } } else if (i.customId === 'close_ticket') { await i.reply('Closing this ticket…'); await closeTicket(i.channel, 'manual close'); } return; }
  if (!i.isChatInputCommand()) return;
  try {
    if (i.commandName === 'ping') return i.reply(`Pong! ${client.ws.ping}ms`);
    if (i.commandName === 'setupserver') { const channels = await createStandardChannels(i.guild); const cfg = guildConfig(i.guild.id); cfg.welcome = { welcomeChannel: channels.welcome, botCommands: channels.botCommands, shop: channels.shop, verify: channels.verify }; cfg.tickets = { ...cfg.tickets, panelChannel: channels.ticketPanel, logs: channels.logs, category: channels.category, inactivityHours: 1, activity: cfg.tickets.activity ?? {} }; await save(configFile, configs); const panel = i.guild.channels.cache.get(channels.ticketPanel); if (panel?.isTextBased()) await panel.send({ embeds: [ticketEmbed()], components: panelRow() }); return i.reply({ content: `✅ Server layout created. Channels: ${Object.values(channels).map(channelMention).join(' ')}\nTickets default to **1 hour** of inactivity. Run the setup commands to customize.`, flags: 64 }); }
    if (i.commandName === 'setup') { const sub = i.options.getSubcommand(); const cfg = guildConfig(i.guild.id); if (sub === 'welcomer') { cfg.welcome = { welcomeChannel: i.options.getChannel('welcome_channel').id, botCommands: i.options.getChannel('bot_commands_channel').id, shop: i.options.getChannel('shop_channel').id, verify: i.options.getChannel('verify_channel').id }; await save(configFile, configs); return i.reply({ content: `✅ Welcomer saved. Welcome: ${channelMention(cfg.welcome.welcomeChannel)} • Commands: ${channelMention(cfg.welcome.botCommands)} • Shop: ${channelMention(cfg.welcome.shop)} • Verify: ${channelMention(cfg.welcome.verify)}`, flags: 64 }); } cfg.tickets = { ...cfg.tickets, panelChannel: i.options.getChannel('panel_channel').id, logs: i.options.getChannel('logs_channel').id, category: i.options.getChannel('category').id, inactivityHours: i.options.getInteger('inactivity_hours'), activity: cfg.tickets.activity ?? {} }; await save(configFile, configs); const panel = i.options.getChannel('panel_channel'); if (panel.isTextBased()) await panel.send({ embeds: [ticketEmbed()], components: panelRow() }); return i.reply({ content: `✅ Tickets saved. Auto-close is **${cfg.tickets.inactivityHours} hour(s)** after the last message.`, flags: 64 }); }
    if (i.commandName === 'setuproles') { const cfg = guildConfig(i.guild.id); cfg.roles = { owner: i.options.getRole('owner_role').id, coOwner: i.options.getRole('co_owner_role').id, admin: i.options.getRole('admin_role').id }; await save(configFile, configs); return i.reply({ content: '✅ Owner, co-owner, and admin roles saved.', flags: 64 }); }
    if (i.commandName === 'ticket') { const channel = await openTicket(i.guild, i.user); return i.reply({ content: `Your ticket is ready: ${channel}`, flags: 64 }); }
    if (i.commandName === 'knowledge') { const sub = i.options.getSubcommand(); const list = knowledge[i.guild.id] ?? []; if (sub === 'add') { const title = clean(i.options.getString('title'), 'Untitled').slice(0, 100); const content = clean(i.options.getString('content')); knowledge[i.guild.id] = [...list.filter((x) => x.title.toLowerCase() !== title.toLowerCase()), { title, content, updatedAt: new Date().toISOString() }]; await save(knowledgeFile, knowledge); return i.reply({ content: `✅ Saved guide **${title}**. Add every bot's setup information with this command; the bot only knows what you provide.`, flags: 64 }); } if (sub === 'list') return i.reply({ content: list.length ? list.map((x) => `• **${x.title}**`).join('\n') : 'No bot guides saved yet.', flags: 64 }); const title = i.options.getString('title').toLowerCase(); knowledge[i.guild.id] = list.filter((x) => x.title.toLowerCase() !== title); await save(knowledgeFile, knowledge); return i.reply({ content: '✅ Guide removed if it existed.', flags: 64 }); }
    if (i.commandName === 'ask') { const q = i.options.getString('question', true); const docs = knowledge[i.guild.id] ?? []; const relevant = docs.filter((x) => q.toLowerCase().split(/\W+/).some((word) => word.length > 2 && `${x.title} ${x.content}`.toLowerCase().includes(word))).slice(0, 5); if (!relevant.length) return i.reply({ content: 'I do not have that bot information yet. An administrator can add it with `/knowledge add`. I will not invent setup instructions.', flags: 64 }); const context = relevant.map((x) => `BOT/GUIDE: ${x.title}\n${x.content}`).join('\n\n'); let answer = `Here is the matching information I have:\n\n${context}`; if (process.env.AI_API_KEY) { const response = await fetch(process.env.AI_BASE_URL ?? 'https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.AI_API_KEY}` }, body: JSON.stringify({ model: process.env.AI_MODEL ?? 'gpt-4o-mini', messages: [{ role: 'system', content: 'Answer only from the supplied bot guides. If the answer is missing, say so. Keep it concise.' }, { role: 'user', content: `Question: ${q}\n\nGuides:\n${context}` }], temperature: 0.2 }) }); if (response.ok) { const data = await response.json(); answer = data.choices?.[0]?.message?.content ?? answer; } } return i.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('🤖 Bot setup assistant').setDescription(answer.slice(0, 4000)).setFooter({ text: 'Answers are based only on administrator-provided guides.' })] }); }
  } catch (error) { console.error(`[${i.commandName}]`, error.message); const reply = { content: 'That action failed. Check the bot permissions, role hierarchy, channel/category settings, and hosting logs.', flags: 64 }; if (i.replied || i.deferred) await i.followUp(reply).catch(() => {}); else await i.reply(reply).catch(() => {}); }
});
client.login(process.env.DISCORD_TOKEN).catch((e) => { console.error('Could not log in:', e.message); process.exit(1); });
process.on('SIGINT', () => { client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { client.destroy(); process.exit(0); });
