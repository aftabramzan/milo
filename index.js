// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const cloudinary = require('cloudinary').v2; // Cloudinary SDK
// const fs = require('fs');
// const app = express();
// const port = 3000;

// // Cloudinary configuration (replace with your own credentials)
// cloudinary.config({
//   cloud_name: 'dja2p5cto', // Your Cloudinary cloud name
//   api_key: '365484131315443',       // Your Cloudinary API key
//   api_secret: 'QGhjG2DHdoReD1SDLfeZ-hDMC2w'  // Your Cloudinary API secret
// });

// // Set up multer storage configuration
// const storage = multer.memoryStorage(); // Use memory storage to upload to Cloudinary
// const upload = multer({ storage: storage });



// // Root Route: Simple Upload Form (for testing)
// app.get('/', (req, res) => {
//   res.send(`
//     <h2>Upload an Image</h2>
//     <form action="/cloudpost" method="POST" enctype="multipart/form-data">
//         <input type="file" name="profile_image" required />
//         <button type="submit">Upload</button>
//     </form>
//   `);
// });

// // Cloudinary Upload Route
// app.post('/cloudpost', upload.single('profile_image'), async (req, res) => {
//   try {
//     // Check if image is provided
//     if (!req.file) {
//       return res.status(400).json({ error: "Profile image is required" });
//     }

//     // Upload to Cloudinary using the image buffer
//     const uploadResult = await cloudinary.uploader.upload(
//       `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
//       {
//         folder: "profiles", // Folder in Cloudinary to store the image
//       }
//     );

//     const imageUrl = uploadResult.secure_url; // The URL of the uploaded image

//     // Send a successful response with the image URL
//     res.status(201).json({
//       success: true,
//       message: "✅ Image uploaded to Cloudinary",
//       image_url: imageUrl,
//     });

//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({
//       error: "Server error",
//       message: err.message,
//     });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const port = 3000;

// ⚠️ In production use ENV variables, not hard-coded keys
cloudinary.config({
  cloud_name: 'dja2p5cto',
  api_key: '365484131315443',
  api_secret: 'QGhjG2DHdoReD1SDLfeZ-hDMC2w'
});

// Store file in memory (not disk)
const upload = multer({ storage: multer.memoryStorage() });

app.post('/cloudpost', upload.single('profile_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Profile image is required" });
    }

    // Upload buffer directly as stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "profiles" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    res.status(200).json({
      success: true,
      image_url: result.secure_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
