const admin = require('firebase-admin');
const serviceAccount = require('../webnovels-6526c-firebase-adminsdk-1od94-a801cffe16.json');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'webnovels-6526c.appspot.com' // Replace with your Firebase project ID
});

const bucket = admin.storage().bucket();

const uploadImageToFirebase = async (file, folder = '') => {
  const fileName = `${folder}/${Date.now()}${path.extname(file.originalname)}`;
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => reject(err));
    blobStream.on('finish', () => {
      blob.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      }).then(urls => {
        resolve(urls[0]);
      });
    });
    blobStream.end(file.buffer);
  });
};

const deleteImageFromFirebase = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    console.log(`Attempting to delete file: ${fileName}`);
    console.log(`Full image URL: ${imageUrl}`);

    const file = bucket.file(fileName);
    
    const [exists] = await file.exists();
    if (!exists) {
      console.log(`File ${fileName} does not exist in the root. Checking subfolders...`);
      // Attempt to find the file in subfolders
      const [files] = await bucket.getFiles();
      const matchingFile = files.find(f => f.name.endsWith(fileName));
      if (matchingFile) {
        console.log(`Found file in: ${matchingFile.name}`);
        await matchingFile.delete();
        console.log(`Successfully deleted ${matchingFile.name}`);
        return;
      }
      console.log(`File ${fileName} not found in any subfolder.`);
      return;
    }
    
    await file.delete();
    console.log(`Successfully deleted ${fileName}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

module.exports = { deleteImageFromFirebase, uploadImageToFirebase };