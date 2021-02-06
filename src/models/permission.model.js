const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    module: {
      type: String,
      required: true,
    },
    capability: {
      type: String,
      required: true,
    },
    scope: {
      type: Object,
      required: false,
    },
  },
  { timestamps: true },
);

schema.methods.fullName = function fullName() {
  return this.module + '.' + this.capability;
};

module.exports = model('permission', schema);
