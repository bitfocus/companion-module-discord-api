import { graphics } from 'companion-module-utils'

interface CacheEntry {
	data: string
	timestamp: number
}

const PNG64_CACHE = new Map<string, CacheEntry>()
const CACHE_TTL = 1 * 60 * 60 * 1000 // 1 hour

/**
 * Nettoie les entrées expirées du cache
 */
function cleanExpiredCache(): void {
	const now = Date.now()
	for (const [url, entry] of PNG64_CACHE.entries()) {
		if (now - entry.timestamp > CACHE_TTL) {
			PNG64_CACHE.delete(url)
		}
	}
}

/**
 * Récupère une valeur du cache si elle existe et n'est pas expirée
 */
function getCacheEntry(url: string): string | null {
	const entry = PNG64_CACHE.get(url)
	if (!entry) return null

	const now = Date.now()
	if (now - entry.timestamp > CACHE_TTL) {
		PNG64_CACHE.delete(url)
		return null
	}

	return entry.data
}

/**
 * Stocke une valeur dans le cache
 */
function setCacheEntry(url: string, data: string): void {
	PNG64_CACHE.set(url, {
		data,
		timestamp: Date.now(),
	})
}

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
			const srcX = Math.floor((x / targetWidth) * sourceWidth)
			const srcY = Math.floor((y / targetHeight) * sourceHeight)

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
		cleanExpiredCache()
		const cachedData = getCacheEntry(url)
		if (cachedData) {
			return cachedData
		}

		const buff = await getImage(url)
		if (!buff) return null

		const dims = getImageDimensions(buff)
		if (!dims) return null

		const base64Png = buff.toString('base64')
		const rgbaBuffer = await graphics.parseBase64(base64Png, { alpha: true })

		const resizedRgba = dims.width !== targetWidth || dims.height !== targetHeight ? resizeRGBABuffer(rgbaBuffer, dims.width, dims.height, targetWidth, targetHeight) : rgbaBuffer

		const png64 = graphics.toPNG64({
			image: resizedRgba,
			width: targetWidth,
			height: targetHeight,
		})

		if (png64) {
			setCacheEntry(url, png64)
		}

		return png64
	} catch (_) {
		return null
	}
}

export function scaleIconBuffer(sourceBuffer: Uint8Array, sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): Uint8Array {
	const targetBuffer = Buffer.alloc(targetWidth * targetHeight * 4)

	for (let y = 0; y < targetHeight; y++) {
		for (let x = 0; x < targetWidth; x++) {
			const sourceX = Math.floor((x / targetWidth) * sourceWidth)
			const sourceY = Math.floor((y / targetHeight) * sourceHeight)
			const sourceIndex = (sourceY * sourceWidth + sourceX) * 4
			const targetIndex = (y * targetWidth + x) * 4

			targetBuffer[targetIndex] = sourceBuffer[sourceIndex]
			targetBuffer[targetIndex + 1] = sourceBuffer[sourceIndex + 1]
			targetBuffer[targetIndex + 2] = sourceBuffer[sourceIndex + 2]
			targetBuffer[targetIndex + 3] = sourceBuffer[sourceIndex + 3]
		}
	}

	return targetBuffer
}
