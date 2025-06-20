// // models/Documents.js
// const mongoose = require("mongoose");

// const documentSchema = new mongoose.Schema({
//   company: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Company",
//     required: true,
//   },
//   filename: {
//     type: String,
//     required: true,
//   },
//   path: {
//     type: String, // base64-encoded string or path if using GridFS/S3
//     required: true,
//   },
//   uploadedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Document", documentSchema);
