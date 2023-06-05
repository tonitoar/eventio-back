const mongoose = require ("mongoose");
const {Schema} = mongoose; 

const EventsUserSchema = new Schema ({
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

const EventsUser = mongoose.model("Event", EventsUserSchema);
module.exports = EventsUser; 
