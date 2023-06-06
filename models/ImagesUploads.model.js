const mongoose = require('mongoose');

const imageUploadsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who uploaded the images
  imageUrls: [{ type: String }], // Array of image URLs uploaded by the user
});

const ImageUploads = mongoose.model('ImageUploads', imageUploadsSchema);

module.exports = ImageUploads;
