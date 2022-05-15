require("dotenv").config();
const WebSocket = require("ws");
const axios = require("axios").default;
const ws = new WebSocket("wss://open-chat.trovo.live/chat");
const announce = require("./schemas/TrovoAnnounceSchema");

ws.on("open", async () => {
  console.log("Connected!");
  const token = await getShardToken(0, 1);
  console.log(token);
  ws.send(
    JSON.stringify({
      type: "AUTH",
      nonce: "You can keep your magic, i have laser beams",
      data: {
        token,
      },
    })
  );
});

async function getShardToken(number, total) {
  try {
    const url =
      "https://open-api.trovo.live/openplatform/chat/shard-token?current_shard=" +
      number +
      "&total_shard=" +
      total;
    const headers = {
      Accept: "application/json",
      "Client-ID": process.env.TROVO_CLIENT_ID,
    };
    const response = await axios.get(url, { headers });
    const token = response.data.token;
    return token;
  } catch (error) {
    console.error(error);
  }
}

function formList(list) {
  const result = [];
  for (const item of list) {
    result.push(item.nickname);
  }
  return result;
}

async function wsWork(raw, client) {
  const { type, data } = JSON.parse(raw);
  if (!data || data?.chats[0].type !== 5012) return;
  const { content, user_name, uid } = data.chats[0];
  // console.log(`${user_name}: ${content}`);
  const dbList = await announce.find({});
  const username = user_name.toLowerCase();
  const streamers = formList(dbList);
  if (streamers.includes(username)) {
    const streamDB = await announce.findOne({
      nickname: username,
    });
    if (content === "stream_on") {
      if (streamDB.online) return;
      console.log(`${streamDB.nickname} is now online!`);
      console.log(`${streamDB}`);
      streamDB.discordList.forEach((channelId) => {
        client.channels.cache
          .get(channelId)
          .send(`${streamDB.nickname} is now online!`);
      });
      await announce.updateOne(
        { nickname: streamDB.nickname },
        { online: true }
      );
    } else {
      if (!streamDB.online) return;
      console.log(`${streamDB.nickname} went offline!`);
      streamDB.discordList.forEach((channelId) => {
        client.channels.cache
          .get(channelId)
          .send(`${streamDB.nickname} went offline!`);
      });
      await announce.updateOne(
        { nickname: streamDB.nickname },
        { online: false, lastOffline: (Date.now() / 1000).toFixed(0) }
      );
    }
  }
}

module.exports = {
  ws,
  wsWork,
};
