require("dotenv").config();
const axios = require("axios");
const announcement = require("./schemas/TrovoAnnounceSchema");

async function sendAnnouncement(client) {
  try {
    const streamers = await announcement.find();
    for (const streamer of streamers) {
      const onlineStatus = await getStreamInfo(streamer.nickname);
      if (
        onlineStatus.is_live &&
        !streamer.online &&
        (Date.now() / 1000).toFixed(0) - streamer.lastOffline > 300
      ) {
        streamer.online = true;
        await streamer.save();
        const start = Number(onlineStatus.started_at);
        for (const channelId of streamer.discordList) {
          const channel = client.channels.cache.get(channelId);
          if (channel && channel.isText()) {
            channel.send(
              `Due to technical reasons, alert has not been sent.\n ${streamer.nickname} is live since <t:${start}:t>! https://trovo.live/${streamer.nickname}`
            );
          }
        }
      } else if (!onlineStatus.is_live && streamer.online) {
        streamer.online = false;
        streamer.lastOffline = Number(onlineStatus.ended_at);
        if ((Date.now() / 1000).toFixed(0) - streamer.lastOffline > 300) {
          for (const channelId of streamer.discordList) {
            const channel = client.channels.cache.get(channelId);
            if (channel && channel.isText()) {
              channel.send(
                `Due to technical reasons, alert has not been sent.\n ${streamer.nickname} went offline at <t:${streamer.lastOffline}:t>!`
              );
            }
          }
        }
        await streamer.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function getStreamInfo(streamerName) {
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
    const { is_live, started_at, ended_at } = response.data;
    const result = { is_live, started_at, ended_at };
    return result;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  getStreamInfo: getStreamInfo,
  sendAnnouncement: sendAnnouncement,
};
