require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const cooldowns = new Map();
const COMMAND_COOLDOWN = 3000;
const MESSAGE_DELAY = 1000;

const command = new SlashCommandBuilder()
  .setName('prokast')
  .setDescription('Прокаст');

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  // Clear old global commands
  await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
  for (const guild of client.guilds.cache.values()) {
    await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), {
      body: [command.toJSON()],
    });
    console.log(`Slash command registered in ${guild.name}`);
  }
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'prokast') return;

  const userId = interaction.user.id;
  const now = Date.now();
  const lastUsed = cooldowns.get(userId);

  if (lastUsed && now - lastUsed < COMMAND_COOLDOWN) {
    const remaining = ((COMMAND_COOLDOWN - (now - lastUsed)) / 1000).toFixed(1);
    await interaction.reply({ content: `Подожди ${remaining} сек. перед повторным использованием.`, ephemeral: true });
    return;
  }

  cooldowns.set(userId, now);

  await interaction.reply({ content: '💀 Прокаст начался...', ephemeral: true });
  const channel = interaction.channel;

  await channel.send('...');

  await delay(MESSAGE_DELAY);
  await channel.send('💀');

  const gifs = ['ants.gif', 'homelander.gif', 'morgan.gif', 'jonah_hill.gif'];
  for (const gif of gifs) {
    await delay(MESSAGE_DELAY);
    const file = new AttachmentBuilder(path.join(__dirname, 'gifs', gif));
    await channel.send({ files: [file] });
  }
});

client.login(process.env.BOT_TOKEN);
