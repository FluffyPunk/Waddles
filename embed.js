const { MessageEmbed } = require("discord.js");

module.exports = {
  async send(client, channel, data) {
    const embed = new MessageEmbed()
      .setColor("#32d937")
      .setAuthor({
        name: data.username,
        iconURL: data.profile_pic,
        url: data.channel_url,
      })
      .setTitle(data.live_title)
      .setFields(
        { name: "Game", value: data.category_name },
        { name: "Live URL", value: data.channel_url }
      )
      .setImage(data.thumbnail);
    client.channels.cache.get(channel).send({ embeds: [embed] });
  },
};
