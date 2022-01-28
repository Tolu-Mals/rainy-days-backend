const mongoose = require('mongoose');
const { Schema } = mongoose;

const BankInformationSchema = new Schema({
    account_number: {
        type: Number,
        required: false,
        unique: true
    },
    account_name: {
        type: String,
        required: false
    },
    bvn: {
        type: Number,
        required: false
    }
});

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
    first_name: {
        type: String,
        required: false
    },
    last_name: {
        type: String,
        required: false
    },
    dob: {
        type: Date,
        required: false
    },
    phone_number: {
        type: String,
        required: false
    },
    bank_information: BankInformationSchema,
    transaction_pin: {
        type: Number,
        required: false
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    register_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('user', UserSchema);