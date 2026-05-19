const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Read environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || '';

let r2Client = null;
let isR2Configured = false;

// Check if all necessary variables are configured
if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME) {
  try {
    r2Client = new S3Client({
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      region: 'auto',
    });
    isR2Configured = true;
    console.log('☁️ [R2 Storage] Cloudflare R2 Client initialized successfully!');
  } catch (error) {
    console.error('❌ [R2 Storage] Failed to initialize R2 Client:', error);
  }
} else {
  console.log('⚠️ [R2 Storage] Cloudflare R2 variables not fully configured. Falling back to Local Disk Storage.');
}

/**
 * Uploads a file buffer directly to Cloudflare R2 Bucket
 * @param {Buffer} fileBuffer The binary buffer of the file
 * @param {string} originalFilename Original name of the file
 * @param {string} mimeType Mime type of the file (e.g. image/png)
 * @param {string} folder The virtual folder inside the bucket (e.g. 'avatars', 'banners', 'badges')
 * @returns {Promise<string|null>} Public URL of the uploaded file on CDN, or null if R2 is not configured
 */
async function uploadToR2(fileBuffer, originalFilename, mimeType, folder = 'uploads') {
  if (!isR2Configured || !r2Client) {
    return null;
  }

  // Clean filename to make a unique safe key
  const cleanedName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  
  // Prevent duplicate 13-digit timestamp if already present in the filename
  let uniqueKey;
  if (/\d{13}/.test(cleanedName)) {
    uniqueKey = `${folder}/${cleanedName}`;
  } else {
    uniqueKey = `${folder}/${Date.now()}-${cleanedName}`;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await r2Client.send(command);

    // Format final public CDN URL
    const publicDomain = R2_PUBLIC_DOMAIN.replace(/\/$/, ''); // Remove trailing slash if any
    const fileUrl = `${publicDomain}/${uniqueKey}`;
    
    console.log(`✅ [R2 Storage] File successfully uploaded to R2! CDN URL: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error('❌ [R2 Storage] Error uploading file to R2:', error);
    throw error;
  }
}

/**
 * Deletes a file from Cloudflare R2 Bucket using its public CDN URL
 * @param {string} fileUrl The public CDN URL of the file
 * @returns {Promise<boolean>} True if successfully deleted, false otherwise
 */
async function deleteFromR2(fileUrl) {
  if (!isR2Configured || !r2Client || !fileUrl) {
    return false;
  }

  try {
    // Extract key from URL
    const publicDomain = R2_PUBLIC_DOMAIN.replace(/\/$/, ''); // e.g. "https://cdn-storage.treetmi.id"
    let key = '';
    
    if (fileUrl.startsWith(publicDomain)) {
      key = fileUrl.replace(publicDomain, '').replace(/^\//, ''); // Remove domain and leading slash
    } else {
      // Fallback: search for folder prefixes to resolve the key
      const folderPrefixes = ['uploads/', 'avatars/', 'banners/', 'badges/'];
      for (const p of folderPrefixes) {
        const index = fileUrl.indexOf(p);
        if (index !== -1) {
          key = fileUrl.substring(index);
          break;
        }
      }
    }

    if (!key) {
      console.log(`⚠️ [R2 Storage] Could not extract R2 key from URL: ${fileUrl}`);
      return false;
    }

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    console.log(`✅ [R2 Storage] File successfully deleted from R2 bucket: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ [R2 Storage] Error deleting file ${fileUrl} from R2:`, error);
    return false;
  }
}

module.exports = {
  isR2Configured,
  uploadToR2,
  deleteFromR2
};
