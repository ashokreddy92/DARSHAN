const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    // Password is now optional for Email OTP authentication
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'ORGANIZER', 'TEMPLE_STAFF'],
      default: 'USER'
    },
    temple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Temple',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    profileImage: {
      type: String,
      default: ''
    },
    // Phone is optional on initial OTP sign-in
    phone: {
      type: String,
      required: false,
      trim: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt if provided
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
