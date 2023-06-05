const mongoose = require ("mongoose");
const {Schema} = mongoose; 

const UserSchema = new Schema ({
    username: String,
    email: {
        type: String, 
        unique:true},
    password: String,
    eventsCreated: [{
        type: Schema.Types.ObjectId,
        ref:"Event"
    }],
    isAdmin: Boolean, 
});

const User = mongoose.model("User", UserSchema);
module.exports = User; 

