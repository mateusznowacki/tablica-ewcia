import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import './index.css'

function App() {
    return (
        <div className="tldraw__editor">
            <Tldraw persistenceKey="my-tldraw-persistence-key" />
        </div>
    )
}

export default App
