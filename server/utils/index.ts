import { Buffer } from 'node:buffer'
import { $fetch } from 'ofetch'
import sharp from 'sharp'

export async function imageUrl2Base64(url: string): Promise<string> {
  try {
    const image = await $fetch(url, {
      responseType: 'arrayBuffer',
    })
    if (image) {
      const _base64 = Buffer.from(image).toString('base64')
      return _base64
    }
    return ''
  }
  catch (error) {
    console.error('imageUrl2Base64 error:', error)
    return ''
  }
}

export async function imageCoverCropping(image_base64: string | undefined, width: number, height: number) {
  if (!image_base64)
    return ''
  try {
    const image = Buffer.from(image_base64, 'base64')
    const resizedBuffer = await sharp(image)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat('png')
      .toBuffer()

    const base64String = resizedBuffer.toString('base64')
    return base64String
  }
  catch (error) {
    console.error('cropping image error:', error)
    return ''
  }
}
