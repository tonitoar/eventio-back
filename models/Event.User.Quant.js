const mongoose = require ("mongoose");
const {Schema} = mongoose; 

const EventUserSchema = new Schema ({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  idEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Event"
  },
  quantity: Number, 

});

const EventUser = mongoose.model("EventUser", EventUserSchema);
module.exports = EventUser; 
