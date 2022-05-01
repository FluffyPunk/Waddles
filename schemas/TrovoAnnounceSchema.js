const mongoose = require("mongoose");

const announceSchema = new mongoose.Schema(
  {
    streamer: {
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
  },
  { optimisticConcurrency: true }
);
announceSchema.index({ streamer: 1 }, { unique: true, background: true });

module.exports = mongoose.model("TrovoAnnounce", announceSchema);
