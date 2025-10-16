const Minio = require('minio');

const logger = createLogger('minio-client');

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'qms_minio_admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'qms_minio_secure_password',
});

/**
 * Ensure bucket exists, create if not
 */
const ensureBucket = async (bucketName) => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      logger.info(`Bucket ${bucketName} created`);
    }
  } catch (error) {
    logger.error(`Error ensuring bucket ${bucketName}:`, error);
    throw error;
  }
};

/**
 * Upload a file to MinIO
 */
const uploadFile = async (bucketName, objectName, buffer, metadata = {}) => {
  try {
    await ensureBucket(bucketName);
    
    await minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      buffer.length,
      metadata
    );
    
    logger.info(`File uploaded: ${objectName} to bucket ${bucketName}`);
    return objectName;
  } catch (error) {
    logger.error(`Error uploading file to MinIO:`, error);
    throw error;
  }
};

/**
 * Download a file from MinIO
 */
const downloadFile = async (bucketName, objectName) => {
  try {
    const dataStream = await minioClient.getObject(bucketName, objectName);
    return dataStream;
  } catch (error) {
    logger.error(`Error downloading file from MinIO:`, error);
    throw error;
  }
};

/**
 * Get presigned URL for direct file access
 */
const getPresignedUrl = async (bucketName, objectName, expiry = 3600) => {
  try {
    const url = await minioClient.presignedGetObject(
      bucketName,
      objectName,
      expiry
    );
    return url;
  } catch (error) {
    logger.error(`Error getting presigned URL:`, error);
    throw error;
  }
};

/**
 * Delete a file from MinIO
 */
const deleteFile = async (bucketName, objectName) => {
  try {
    await minioClient.removeObject(bucketName, objectName);
    logger.info(`File deleted: ${objectName} from bucket ${bucketName}`);
  } catch (error) {
    logger.error(`Error deleting file from MinIO:`, error);
    throw error;
  }
};

module.exports = {
  minioClient,
  ensureBucket,
  uploadFile,
  downloadFile,
  getPresignedUrl,
  deleteFile,
};
