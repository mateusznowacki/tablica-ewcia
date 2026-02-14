import { mkdir, readFile, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { Readable } from 'stream'

// Directory for uploaded assets (images, videos, etc.)
const DIR = resolve(process.env.ASSETS_DIR || './data/assets')

export async function storeAsset(id: string, stream: Readable) {
    await mkdir(DIR, { recursive: true })
    await writeFile(join(DIR, id), stream)
}

export async function loadAsset(id: string) {
    return await readFile(join(DIR, id))
}
