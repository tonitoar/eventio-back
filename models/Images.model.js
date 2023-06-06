const mongoose = require('mongoose');

const imageUploadsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who uploaded the images
  imageUrls: [String], // Array of image URLs uploaded by the user
});

const Images = mongoose.model('Images', imageUploadsSchema);

module.exports = Images;
