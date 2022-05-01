const { SlashCommandBuilder } = require("@discordjs/builders");
const announce = require("../schemas/TrovoAnnounceSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trovo")
    .setDescription(
      "Add or remove a streamer to listen to trovo announcements."
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a streamer to listen to trovo announcements.")
        .addStringOption((streamer) =>
          streamer.setName("streamer").setDescription("The streamer to add.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription(
          "Remove a streamer from listening to trovo announcements."
        )
        .addStringOption((streamer) =>
          streamer.setName("streamer").setDescription("The streamer to remove.")
        )
    ),
  async execute(interaction) {
    const streamer = interaction.options.getString("streamer");

    if (!streamer) {
      await interaction.reply({
        content: "You must specify a streamer!",
        ephemeral: true,
      });
      return;
    }

    const streamerName = streamer.toLowerCase();

    const streamerDoc = await announce.findOne({ streamer: streamerName });

    if (interaction.options.getSubcommand() === "remove") {
      if (!streamerDoc) {
        await interaction.reply({
          content: "That streamer is not listening to trovo!",
          ephemeral: true,
        });
        return;
      } else {
        const discordList = streamerDoc.discordList;
        if (discordList.includes(interaction.channelId)) {
          discordList.splice(discordList.indexOf(interaction.channelId), 1);
          await streamerDoc.save();

          await interaction.reply({
            content: "Successfully removed from listening on trovo!",
          });
        } else {
          await interaction.reply({
            content: "That streamer is not listening to trovo!",
            ephemeral: true,
          });
        }
      }
    } else if (interaction.options.getSubcommand() === "add") {
      if (streamerDoc) {
        const discordList = streamerDoc.discordList;
        if (!discordList.includes(interaction.channelId)) {
          discordList.push(interaction.channelId);
          await streamerDoc.save();

          await interaction.reply({
            content: "Successfully added to listening on trovo!",
          });
        } else {
          await interaction.reply({
            content: "You are already listening to trovo!",
            ephemeral: true,
          });
        }
      } else {
        const newDoc = new announce({
          streamer: streamerName,
          online: false,
          discordList: [interaction.channelId],
        });
        await newDoc.save();

        await interaction.reply({
          content: "Successfully added to listening on trovo!",
        });
      }
    }
  },
};
