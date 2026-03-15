const path = require('path');
const fs = require('fs');

/**
 * Uploads an image to local storage.
 * @param {Object} file - The file object from multer (multer.memoryStorage()).
 * @param {string} folder - The subfolder to store the image in.
 * @returns {Promise<string>} - The relative path of the saved file.
 */
const uploadImage = async (file, folder = '') => {
  const uploadDir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}${path.extname(file.originalname)}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, file.buffer);
  
  // Return the relative path to be saved in DB
  return folder ? `${folder}/${fileName}` : fileName;
};

/**
 * Deletes an image from local storage.
 * @param {string} imageUrl - The relative path or URL of the image.
 */
const deleteImage = async (imageUrl) => {
  try {
    // Only handle local paths (non-absolute URLs)
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      const filePath = path.join(__dirname, '..', 'uploads', imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted local file: ${filePath}`);
      }
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
};

module.exports = { deleteImage, uploadImage };
