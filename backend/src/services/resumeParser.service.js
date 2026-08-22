const pdfParse = require('pdf-parse');

/**
 * Extract clean normalized plain text from uploaded file buffer.
 * @param {Buffer} fileBuffer - Raw uploaded file buffer
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} { text, metadata }
 */
const parseResumeText = async (fileBuffer, mimeType = 'application/pdf') => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('Invalid file buffer');
  }

  let text = '';

  if (mimeType === 'application/pdf' || mimeType.includes('pdf')) {
    try {
      const data = await pdfParse(fileBuffer);
      text = data.text || '';
    } catch (err) {
      console.warn('PDF parsing fallback to string extraction:', err.message);
      text = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    }
  } else {
    // DOCX or plain text extraction
    text = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  }

  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const words = cleanedText ? cleanedText.split(/\s+/).length : 0;
  const chars = cleanedText.length;

  return {
    text: cleanedText,
    metadata: {
      wordCount: words,
      characterCount: chars
    }
  };
};

module.exports = {
  parseResumeText
};
