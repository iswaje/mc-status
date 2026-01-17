const axios = require("axios");

const SERVER_IP = process.env.SERVER_IP;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const MESSAGE_ID = process.env.MESSAGE_ID || "";

if (!SERVER_IP) {
  console.error("Missing SERVER_IP env var.");
  process.exit(1);
}
if (!WEBHOOK_URL) {
  console.error("Missing WEBHOOK_URL env var.");
  process.exit(1);
}

async function run() {
  const res = await axios.get(`https://api.mcsrvstat.us/2/${SERVER_IP}`);
  const data = res.data;

  const online = !!data.online;
  const playersOnline = online && data.players ? data.players.online : 0;
  const playersMax = online && data.players ? data.players.max : 0;

  const embed = {
    title: "Minecraft Server Status",
    description: `**Server:** ${SERVER_IP}`,
    color: online ? 0x00ff00 : 0xff0000,
    fields: [
      { name: "Status", value: online ? "🟢 Online" : "🔴 Offline", inline: true },
      { name: "Players", value: `${playersOnline} / ${playersMax}`, inline: true }
    ],
    footer: { text: "Checked automatically" },
    timestamp: new Date().toISOString()
  };

  const payload = { embeds: [embed] };

  // Edit the same message after MESSAGE_ID is set
  if (MESSAGE_ID) {
    await axios.patch(`${WEBHOOK_URL}/messages/${MESSAGE_ID}`, payload);
    console.log("Edited message:", MESSAGE_ID);
    return;
  }

  // First run: create message and print its ID
  const created = await axios.post(`${WEBHOOK_URL}?wait=true`, payload);
  console.log("Created message id:", created.data.id);
}

run().catch((e) => {
  console.error(e.response?.data || e.message);
  process.exit(1);
});
