const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    default: 'system_settings' 
  },
  demoLoginEnabled: { 
    type: Boolean, 
    default: false 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Static helper to get or create settings
systemConfigSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ key: 'system_settings' });
  if (!settings) {
    settings = await this.create({ key: 'system_settings', demoLoginEnabled: false });
  }
  return settings;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
