const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'announcement'
  title: { type: String, default: "" },
  content: { type: String, default: "" },
  isActive: { type: Boolean, default: false },
  buttonText: { type: String, default: "" },
  buttonLink: { type: String, default: "" },
  displayDate: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Config', configSchema);
