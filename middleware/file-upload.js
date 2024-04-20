const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const serviceAccount = require('../middleware/serviceAccount.json')
// Initialize Firebase Admin SDK with your service account key
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://socialshare-de435.appspot.com'
});

const bucket = admin.storage().bucket();


const fileUpload = multer({
    limits: 500000,
    storage: multer.memoryStorage(),
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        const filename = `${uuidv4()}.${ext}`;
        cb(null, filename);
    },
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : new Error("invalid mime type!")
        cb(error, isValid)
    }
});


const uploadFileToFirebase = (file) => {
    return new Promise((resolve, reject) => {
        const ext = file.originalname.split('.').pop(); // Get file extension
        const filename = `${uuidv4()}.${ext}`; // Generate UUID-based filename with original extension

        const blob = bucket.file(filename); // Use generated filename for the file in Google Cloud Storage
        const blobStream = blob.createWriteStream();
        blobStream.on('finish', async () => {
            // File uploaded successfully, now generate a signed URL for download
            try {
                const fileURL = await blob.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491' // Adjust expiry as needed (e.g., '03-09-2491')
                });
                resolve(fileURL[0]); // Get the first URL (there could be multiple)
            } catch (error) {
                reject(`Error generating signed URL: ${error}`);
            }
        });

        blobStream.on('error', (err) => {
            reject(`Unable to upload file: ${err}`);
        });

        blobStream.end(file.buffer);
    });
};

module.exports = fileUpload;
module.exports.uploadFileToFirebase = uploadFileToFirebase;