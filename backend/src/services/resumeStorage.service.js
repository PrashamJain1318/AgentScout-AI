const fs = require('fs');
const path = require('path');
const os = require('os');

// Detect if we're in a serverless/production deployment or AWS SAM local
const isServerless = process.env.VERCEL === '1' || 
                     process.env.AWS_EXECUTION_ENV || 
                     process.env.LAMBDA_TASK_ROOT ||
                     __dirname.includes('/var/task') ||
                     process.env.NODE_ENV === 'production';

// In serverless environments, the filesystem is read-only except for /tmp
let UPLOADS_DIR = isServerless 
  ? path.join(os.tmpdir(), 'agent-scout-resumes')
  : path.join(__dirname, '../../uploads/resumes');

const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (err) {
      console.warn(`[Storage Service] Could not create upload directory at ${UPLOADS_DIR}, falling back to /tmp:`, err.message);
      // Fallback to /tmp if local path fails (e.g. read-only Docker mounts)
      UPLOADS_DIR = path.join(os.tmpdir(), 'agent-scout-resumes');
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
    }
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

  try {
    await fs.promises.writeFile(filePath, fileBuffer);
    return {
      storageKey: fileName,
      filePath
    };
  } catch (err) {
    console.error(`[Storage Service] Error saving file ${fileName}:`, err.message);
    const error = new Error('Failed to save resume file to storage. Please try again.');
    error.statusCode = 500;
    error.errorCode = 'FILE_WRITE_ERROR';
    throw error;
  }
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
  
  try {
    return await fs.promises.readFile(filePath);
  } catch (err) {
    console.error(`[Storage Service] Error reading file ${storageKey}:`, err.message);
    const error = new Error('Failed to read resume file from storage.');
    error.statusCode = 500;
    error.errorCode = 'FILE_READ_ERROR';
    throw error;
  }
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
      console.warn(`[Storage Service] Failed to delete storage file ${storageKey}:`, err.message);
      // We don't throw on delete failure to avoid breaking other flows like overwrite
    }
  }
};

module.exports = {
  saveFile,
  getFile,
  deleteFile
};
