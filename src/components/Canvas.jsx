
import { useRef,useEffect,useState } from 'react'
import { Shape } from '../utils/Shape';

// Declaration



function Canvas() {
    const canvasRef = useRef(null)
    // const [options,setOptions] = useState({})
    const [elements,setElements] = useState([])
    const [MouseUp, setMouseUp] = useState(false)
    const [action, setAction] = useState('none')
    const [currentShape, setCurrentShape] = useState(null)

    useEffect(()=>{
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "green";
        // ctx.fillRect(10,10,100,100)

        const options = {
          strokeStyle: "green",
          lineWidth: 5,
          lineJoin: "bevel"
        }
        // setOptions(newOptions)
       

        const generator = new Shape(ctx)

        // var pts=[ [5,5], [100,50], [150,200], [60,500]];
        // const poly = generator.polygon(pts,options)
        // const circle = generator.circle(500,500,100,options)
        // const rect = generator.rectangle(200,200, 400, 400, options,)
        // const rect = generator.rectangle(597,217,825,366,options)
        // ctx.clearRect(0,0,canvas.width, canvas.height)
        
        generator.draw(elements)

        // console.log(generator.draw())


      //   generator.draw(ele)

        // generator.draw(elements)

        const onMouseDown = (e) => {
          
          setAction("drawing")
          const {clientX, clientY} = e
          const temp = new Shape(ctx,options)
          const l = temp.ellipse(clientX,clientY,clientX,clientY,options)
          
          setElements(prev => [...prev,l])

          return
          
          // generator.draw(elements)


          
        }
        
        const onMouseUp = (e) => {
          if(action === 'none'){
            return
          }
          // console.log(elements)
          const {clientX, clientY} = e
          
          const tempEle = [...elements]
          const n = tempEle.length-1

          const {x1,y1} = tempEle[n]

          const tempCanvas = new Shape(ctx)
          const finalEle = tempCanvas.ellipse(x1,y1,clientX,clientY)
          
          tempEle[n] = finalEle

          setElements(tempEle)

          setAction('none')
          return
          // console.log(e.clientX,e.clientY)
        }

        const onMouseMove = (e) => {
          const {clientX, clientY} = e

          if(action === 'none'){
            return
          }
          
          const tempEle = [...elements]
          const n = tempEle.length-1

          const {x1,y1} = tempEle[n]

          const tempCanvas = new Shape(ctx)
          const finalEle = tempCanvas.ellipse(x1,y1,clientX,clientY)
          
          tempEle[n] = finalEle

          setElements(tempEle)
          
          // let prev = generator.getElements()
          // const n = prev.length-1
          
          // if(prev[n]){
          //   console.log(1)
          // }

        }

        canvas.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        canvas.addEventListener('mousemove', onMouseMove)

        return() => {
          canvas.removeEventListener('mousedown', onMouseDown)
          document.removeEventListener('mouseup', onMouseUp)
          canvas.removeEventListener('mousemove', onMouseMove)

        }

    },[action,elements])

  return (
    <>
      <canvas ref={canvasRef} id='canvas' height={window.innerHeight} width={window.innerWidth} className=' relative bg-zinc-800'></canvas>

    </>
  )
}

export default Canvas