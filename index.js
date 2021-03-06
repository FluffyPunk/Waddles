require("dotenv").config();

const fs = require("node:fs");
const { Client, Collection, Intents } = require("discord.js");
const token = process.env.TOKEN;
const mongoose = require("mongoose");
const { ws, wsWork } = require("./websocket");
const trovo = require("./Trovo");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
  console.log("Ready!");
  trovo.sendAnnouncement(client);
  ws.once("message", async (raw) => {
    const { type } = JSON.parse(raw);
    if (type === "RESPONSE") {
      setInterval(() => {
        ws.send(
          JSON.stringify({
            type: "PING",
            nonce: "You can keep your magic, i have laser beams",
          })
        );
      }, 30000);
    }
  });
  ws.on("message", async (raw) => await wsWork(raw, client));
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "ACHTUNG KURWA!",
      ephemeral: true,
    });
  }
});

client.login(token);
