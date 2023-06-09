const mongoose = require ("mongoose");
const {Schema} = mongoose; 

const EventSchema = new Schema ({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  title: String,
  date: String,
  hour: String,
  address: String,
  description: String,
  numattendees: Number,
  maxCapacityy: Number,
  photos: [String],
  buyers: [{
    type: Schema.Types.ObjectId,
    ref:"User"
    }],
  iscancelled: Boolean, 

});

const Event = mongoose.model("Event", EventSchema);
module.exports = Event; 

