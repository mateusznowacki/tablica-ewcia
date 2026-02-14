import { useSync } from '@tldraw/sync'
import {
    AssetRecordType,
    getHashForString,
    TLAssetStore,
    TLBookmarkAsset,
    Tldraw,
    uniqueId,
} from 'tldraw'
import 'tldraw/tldraw.css'

// Build the server URL from current page location
// Works in dev (Vite proxy on :3000 → :5858) and production (Traefik routing)
function getServerUrl(): string {
    return `${window.location.protocol}//${window.location.host}`
}

// Room ID — you can make this dynamic (e.g. from URL path)
const roomId = 'tablica-ewcia'

function App() {
    // Create a store connected to multiplayer.
    // useSync expects an HTTP(S) URI — it handles the WS upgrade internally
    const store = useSync({
        uri: `${getServerUrl()}/connect/${roomId}`,
        assets: multiplayerAssets,
    })

    return (
        <div style={{ position: 'fixed', inset: 0 }}>
            <Tldraw
                store={store}
                onMount={(editor) => {
                    editor.registerExternalAssetHandler('url', unfurlBookmarkUrl)
                }}
            />
        </div>
    )
}

// Asset upload/download handling
const multiplayerAssets: TLAssetStore = {
    async upload(_asset, file) {
        const id = uniqueId()
        const objectName = `${id}-${file.name}`
        const url = `${getServerUrl()}/uploads/${encodeURIComponent(objectName)}`

        const response = await fetch(url, {
            method: 'PUT',
            body: file,
        })

        if (!response.ok) {
            throw new Error(`Failed to upload asset: ${response.statusText}`)
        }

        return { src: url }
    },
    resolve(asset) {
        return asset.props.src
    },
}

// Bookmark unfurling
async function unfurlBookmarkUrl({ url }: { url: string }): Promise<TLBookmarkAsset> {
    const asset: TLBookmarkAsset = {
        id: AssetRecordType.createId(getHashForString(url)),
        typeName: 'asset',
        type: 'bookmark',
        meta: {},
        props: {
            src: url,
            description: '',
            image: '',
            favicon: '',
            title: '',
        },
    }

    try {
        const response = await fetch(`${getServerUrl()}/unfurl?url=${encodeURIComponent(url)}`)
        const data = await response.json()

        asset.props.description = data?.description ?? ''
        asset.props.image = data?.image ?? ''
        asset.props.favicon = data?.favicon ?? ''
        asset.props.title = data?.title ?? ''
    } catch (e) {
        console.error(e)
    }

    return asset
}

export default App
