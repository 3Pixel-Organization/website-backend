const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'permission',
        },
      ],
    },
  },
  { timestamps: true },
);

module.exports = model('role', schema);
