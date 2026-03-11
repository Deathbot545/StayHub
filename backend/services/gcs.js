const { Storage } = require("@google-cloud/storage");
const fs = require("fs");
const path = require("path");

const BUCKET_NAME = process.env.GCS_BUCKET || "stay_hub";

let storage;
let bucket;

async function initializeGCS() {
  try {
    const envCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const defaultCredentialsPath = path.join(__dirname, "../gcs-credentials.json");
    const credentialsPath = envCredentialsPath || defaultCredentialsPath;

    const storageConfig = {
      projectId: process.env.GCP_PROJECT_ID,
    };

    // Use key file only when it actually exists; otherwise fall back to ADC.
    if (credentialsPath && fs.existsSync(credentialsPath)) {
      storageConfig.keyFilename = credentialsPath;
      console.log(`Using GCS key file: ${credentialsPath}`);
    } else {
      console.log("No GCS key file found. Using Application Default Credentials.");
    }

    storage = new Storage(storageConfig);

    bucket = storage.bucket(BUCKET_NAME);
    console.log(`✓ GCS client initialized for bucket "${BUCKET_NAME}"`);
    return true;
  } catch (err) {
    console.error("GCS initialization failed:", err.message);
    return false;
  }
}

async function uploadImage(file) {
  if (!bucket) {
    throw new Error("GCS not initialized");
  }

  if (!file || !file.buffer) {
    throw new Error("No file provided");
  }

  const fileName = `listings/${Date.now()}-${file.originalname}`;
  const gcsFile = bucket.file(fileName);

  return new Promise((resolve, reject) => {
    const stream = gcsFile.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on("error", (err) => {
      reject(err);
    });

    stream.on("finish", async () => {
      try {
        let publicUrl;

        try {
          await gcsFile.makePublic();
          publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
        } catch (aclErr) {
          // If bucket policy blocks public ACLs, provide a long-lived signed URL.
          const [signedUrl] = await gcsFile.getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
          });
          publicUrl = signedUrl;
        }

        resolve({
          fileName,
          publicUrl,
          size: file.size,
        });
      } catch (err) {
        reject(err);
      }
    });

    stream.end(file.buffer);
  });
}

async function deleteImage(fileName) {
  if (!bucket) {
    throw new Error("GCS not initialized");
  }

  try {
    await bucket.file(fileName).delete();
    return true;
  } catch (err) {
    console.error("GCS delete failed:", err.message);
    return false;
  }
}

module.exports = {
  initializeGCS,
  uploadImage,
  deleteImage,
  getBucket: () => bucket,
};
