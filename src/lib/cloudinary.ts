import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  return cloudinary;
}

export function optimizedImage(url: string, width = 1200) {
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}