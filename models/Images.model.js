const mongoose = require('mongoose');

const Image = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who uploaded the images
  imageUrls: [String], // Array of image URLs uploaded by the user
  title: { type: String },
});

const Images = mongoose.model('Images', Image);

module.exports = Images;
