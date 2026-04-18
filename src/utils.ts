import { graphics } from 'companion-module-utils'

export const createUUID = (): string => {
	let uuid = ''

	for (let i = 0; i < 32; i += 1) {
		if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-'

		let n
		if (i === 12) {
			n = 4
		} else {
			const random = (Math.random() * 16) | 0

			if (i === 16) {
				n = (random & 3) | 0
			} else {
				n = random
			}
		}

		uuid += n.toString(16)
	}
	return uuid
}

// Range [0, N)
export type Range<N extends number, T extends unknown[] = []> = T['length'] extends N ? never : T['length'] | Range<N, [...T, unknown]>

// Range [Min, Max]
export type IntRange<Min extends number, Max extends number> = Exclude<Range<Max>, Range<Min>> | Min

async function getImage(url: string): Promise<Buffer | undefined> {
	const res = await fetch(url)
	if (!res.ok) return

	return Buffer.from(await res.arrayBuffer())
}

/**
 * Resize RGBA buffer using nearest neighbor algorithm
 * @param source Source RGBA buffer
 * @param sourceWidth Original width
 * @param sourceHeight Original height
 * @param targetWidth Target width
 * @param targetHeight Target height
 * @returns Resized RGBA buffer
 */
function resizeRGBABuffer(source: Uint8Array, sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): Uint8Array {
	const target = new Uint8Array(targetWidth * targetHeight * 4)

	for (let y = 0; y < targetHeight; y++) {
		for (let x = 0; x < targetWidth; x++) {
			// Calculate source pixel coordinates using nearest neighbor
			const srcX = Math.floor((x / targetWidth) * sourceWidth)
			const srcY = Math.floor((y / targetHeight) * sourceHeight)

			// Copy RGBA values
			const srcIdx = (srcY * sourceWidth + srcX) * 4
			const dstIdx = (y * targetWidth + x) * 4

			target[dstIdx] = source[srcIdx] // R
			target[dstIdx + 1] = source[srcIdx + 1] // G
			target[dstIdx + 2] = source[srcIdx + 2] // B
			target[dstIdx + 3] = source[srcIdx + 3] // A
		}
	}

	return target
}

/**
 * Get image dimensions from PNG buffer
 * PNG format: signature (8 bytes) + chunks, first chunk is IHDR with width/height at offset 16-24
 */
function getImageDimensions(pngBuffer: Buffer): { width: number; height: number } | null {
	if (pngBuffer.length < 24) return null

	// PNG IHDR chunk is at offset 8, width is at offset 16-20, height at offset 20-24
	const width = pngBuffer.readUInt32BE(16)
	const height = pngBuffer.readUInt32BE(20)

	return { width, height }
}

/**
 * Convert image URL to PNG64 data URI with optional resizing
 * @param url Image URL to fetch
 * @param targetWidth Target width for the output image
 * @param targetHeight Target height for the output image
 * @returns PNG64 data URI string or null on error
 */
export async function urlToPng64(url: string, targetWidth: number, targetHeight: number): Promise<string | null> {
	try {
		const buff = await getImage(url)
		if (!buff) return null

		// Get original image dimensions from PNG header
		const dims = getImageDimensions(buff)
		if (!dims) return null

		const base64Png = buff.toString('base64')
		const rgbaBuffer = await graphics.parseBase64(base64Png, { alpha: true })

		// Resize RGBA buffer to target dimensions if needed
		const resizedRgba = dims.width !== targetWidth || dims.height !== targetHeight ? resizeRGBABuffer(rgbaBuffer, dims.width, dims.height, targetWidth, targetHeight) : rgbaBuffer

		const png64 = graphics.toPNG64({
			image: resizedRgba,
			width: targetWidth,
			height: targetHeight,
		})

		return png64
	} catch (_) {
		return null
	}
}
