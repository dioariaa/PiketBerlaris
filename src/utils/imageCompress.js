import imageCompression from 'browser-image-compression'

export async function compressImage(file) {
  return await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  })
}
