const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Missing Cloudinary config. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? 'Upload failed');

  const url = data?.secure_url ?? data?.url;
  if (!url) throw new Error('Cloudinary returned no URL');

  return url as string;
}