require("dotenv").config();
const axios = require("axios");
const announcement = require("./schemas/TrovoAnnounceSchema");
/*

Freq: 1/20 sec

1. Take MongoDB collection of all users
2. For each user, get their online status
3. If online went from false to true, send announcement

*/

async function sendAnnouncement(client) {
  try {
    const streamers = await announcement.find();
    for (const streamer of streamers) {
      const onlineStatus = await getOnlineStatus(streamer.streamer);
      if (onlineStatus && !streamer.online) {
        streamer.online = true;

        await streamer.save();
        for (const channel of streamer.discordList) {
          client.channels.cache.get(channel).send({
            embeds: [
              {
                title: `${streamer.streamer} is live!`,
                description: `Join! https://trovo.live/${streamer.streamer}`,
                color: 0x00ff00,
                timestamp: new Date(),
                footer: {
                  text: "Trovo",
                },
              },
            ],
          });
        }
      } else if (!onlineStatus && streamer.online) {
        streamer.online = false;
        streamer.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function getOnlineStatus(streamerName) {
  try {
    const url = "https://open-api.trovo.live/openplatform/channels/id";
    const headers = {
      Accept: "application/json",
      "Client-ID": process.env.TROVO_CLIENT_ID,
    };
    const data = {
      username: streamerName,
    };
    const response = await axios.post(url, data, { headers });
    const res = response.data;
    return res.is_live;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getOnlineStatus: getOnlineStatus,
  sendAnnouncement: sendAnnouncement,
};
