require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'prokast') return;

  await interaction.reply('...');
  const channel = interaction.channel;

  await channel.send('💀');

  const gifs = ['ants.gif', 'homelander.gif', 'morgan.gif', 'jonah_hill.gif'];
  for (const gif of gifs) {
    const file = new AttachmentBuilder(path.join(__dirname, 'gifs', gif));
    await channel.send({ files: [file] });
  }
});

client.login(process.env.BOT_TOKEN);
