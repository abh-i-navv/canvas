import { useState } from 'react'
import Canvas from './components/Canvas'
import CanvasGPT from './components/CanvasGPT'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='absolute'>
      <Canvas />
      {/* <CanvasGPT /> */}
    </div>
    </>
  )
}

export default App
