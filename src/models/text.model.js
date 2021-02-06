const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    key: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

schema.methods.safe = function safe() {
  return this.toObject({ versionKey: false });
};

schema.index({ key: 'text', value: 'text' });

/**
 * @type import('mongoose').Model
 */
module.exports = model('text', schema);
