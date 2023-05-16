const express = require('express');
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const cors = require('cors');

// Configure AWS SDK
const s3Client = new S3Client({
  region: 'ap-south-1', // e.g., ap-south-1
  credentials: {
    accessKeyId: 'AKIAZCOISJATXC2ZXYJ7',
    secretAccessKey: 'b3nwDFYAMQxJynXAQjBcQELlCqgg7B1d67Xict+Y',
  },
});

const app = express();

// Enable CORS
app.use(cors());

// Create multer middleware for file upload
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'sivive-textract',
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = ['.pdf', '.png', '.jpg', '.jpeg'];
    const extname = path.extname(file.originalname);
    if (allowedFileTypes.includes(extname.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'));
    }
  },
});

// POST endpoint for file upload
app.post('/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const fileUrl = `https://sivive-textract.s3.amazonaws.com/${req.file.key}`;
    console.log('File URL:', fileUrl);

    // Save the file URL or any other necessary information in the database

    return res.status(200).json({ success: 'File uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
