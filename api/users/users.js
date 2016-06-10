var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, required: true},
    submissions: {type: Array, default: []},
    totalPoints: Number,
    history: {type:Array, default: []}
});

userSchema.methods = {
    generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },
    validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    }
};

module.exports = mongoose.model('User', userSchema);
