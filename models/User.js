const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
    date_received: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: false
    }
})

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    notifications: [NotificationSchema],
    register_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('user', UserSchema);