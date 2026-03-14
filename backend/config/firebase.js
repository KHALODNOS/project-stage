const path = require('path');
const fs = require('fs');

const uploadImageToFirebase = async (file, folder = '') => {
  // Fallback to storing locally since Firebase credentials are an issue
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

const deleteImageFromFirebase = async (imageUrl) => {
  try {
    // Check if it's a local file format and try to delete it
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      const filePath = path.join(__dirname, '..', 'uploads', imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted local file: ${filePath}`);
      }
    } else {
        console.log(`Cannot delete Firebase file as credentials are invalid: ${imageUrl}`);
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
};

module.exports = { deleteImageFromFirebase, uploadImageToFirebase };