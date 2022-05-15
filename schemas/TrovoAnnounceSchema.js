const mongoose = require("mongoose");

const announceSchema = new mongoose.Schema(
  {
    nickname: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    online: {
      type: mongoose.SchemaTypes.Boolean,
      required: true,
    },
    discordList: {
      type: mongoose.SchemaTypes.Array,
    },
    lastOffline: {
      type: mongoose.SchemaTypes.Number,
    },
  },
  { optimisticConcurrency: true }
);
announceSchema.index({ nickname: 1 }, { unique: true, background: true });

module.exports = mongoose.model("TrovoAnnounce", announceSchema);
