const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');

const schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      index: true,
      lowercase: true,
      validate: [isEmail, 'Please enter a valid email'],
    },
    username: {
      type: String,
      required: [true, 'Please enter a username'],
      minlength: [2, 'Username must be at least 2 characters long'],
      maxlength: [32, 'Username must be at most 32 characters long'],
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
    },
    oauth: {
      discord: {
        type: String,
        unique: true,
        index: true,
      },
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'role',
      },
    ],
  },
  { timestamps: true },
);

schema.methods.safe = function safe() {
  const user = this.toObject({ versionKey: false });
  delete user.password;
  return user;
};

schema.methods.checkForPermission = function checkForPermission(perm) {
  if (!this.populated('roles')) {
    throw new Error('Tried to check for permissions but roles field is not populated');
  }
  for (const role of this.roles) {
    for (const permission of role.permissions) {
      if (perm === permission.module + '.' + permission.capability) {
        return true;
      }
    }
  }
};

module.exports = model('user', schema);
