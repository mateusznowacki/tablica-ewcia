import { Tldraw } from 'tldraw'
import { useYjsStore } from './useYjsStore'
import 'tldraw/tldraw.css'
import './index.css'

const HOST_URL = import.meta.env.PROD
    ? 'wss://tablica.nexocloud.pl/ws' // Websocket protocol for production via Traefik
    : 'ws://localhost:1234'

function App() {
    const store = useYjsStore({
        roomId: 'example-room',
        hostUrl: HOST_URL,
        shapeUtils: [],
    })

    return (
        <div className="tldraw__editor">
            <Tldraw store={store} />
        </div>
    )
}

export default App
