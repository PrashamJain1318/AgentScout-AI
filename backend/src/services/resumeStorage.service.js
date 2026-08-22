const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads/resumes');

const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

/**
 * Save file buffer safely to disk storage abstraction.
 */
const saveFile = async (userId, fileBuffer, originalName) => {
  ensureUploadsDir();
  const ext = path.extname(originalName) || '.pdf';
  const fileName = `${userId}_${Date.now()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  await fs.promises.writeFile(filePath, fileBuffer);
  return {
    storageKey: fileName,
    filePath
  };
};

/**
 * Read file buffer from storage abstraction.
 */
const getFile = async (storageKey) => {
  ensureUploadsDir();
  const filePath = path.join(UPLOADS_DIR, storageKey);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return await fs.promises.readFile(filePath);
};

/**
 * Delete file from storage abstraction.
 */
const deleteFile = async (storageKey) => {
  if (!storageKey) return;
  const filePath = path.join(UPLOADS_DIR, storageKey);
  if (fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.warn(`Failed to delete storage file ${storageKey}:`, err.message);
    }
  }
};

module.exports = {
  saveFile,
  getFile,
  deleteFile
};
