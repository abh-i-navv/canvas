
import { useRef,useEffect,useState } from 'react'
import { Shape } from '../utils/Shape';
import { getStroke } from 'perfect-freehand'

// Declaration

const average = (a, b) => (a + b) / 2

function getSvgPathFromStroke(points, closed = true) {
  const len = points.length

  if (len < 4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `
  }

  if (closed) {
    result += 'Z'
  }

  return result
}

const drawElement= (generator, shape, x1,y1,x2,y2,options) => {

  switch(shape){
    case "rectangle":
      return generator.rectangle(x1,y1,x2,y2,options)
    case "line":
      return generator.line(x1,y1,x2,y2,options)
    
    case "ellipse":
    return generator.ellipse(x1,y1,x2,y2,options)
    
    default:
      return
  }

}


function Canvas() {
    const canvasRef = useRef(null)
    // const [options,setOptions] = useState({})
    const [elements,setElements] = useState([[]])
    const [tool, setTool] = useState('brush')
    const [action, setAction] = useState('none')
    const [points,setPoints] = useState([])

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

          if(tool === 'brush'){
            setPoints([])
            setPoints([[clientX,clientY]])

          }
          else{

            const temp = new Shape(ctx,options)
            
            const l = drawElement(temp,tool,clientX,clientY,clientX,clientY,options)
            
            setElements(prev => [...prev,l])
            
            return
          }
             
        }
        
        

        const onMouseMove = (e) => {
          const {clientX, clientY} = e

          if(action === 'none'){
            return
          }
          
          if(tool === 'brush'){
            setPoints(prev => [...prev, [clientX,clientY]])
            
            const outlinePoints = getStroke(points)
            const pathData = getSvgPathFromStroke(outlinePoints)
            const newSvg = generator.svg(pathData,options)
            const n = elements.length-1
            
            const updateEle = [...elements]
            updateEle[n] = newSvg
            setElements(updateEle)

          } 
          
          else{

            const tempEle = [...elements]
            const n = tempEle.length-1
            
            const {x1,y1} = tempEle[n]
            
            const temp = new Shape(ctx)
            const finalEle = drawElement(temp,tool,x1,y1,clientX,clientY)
            
            tempEle[n] = finalEle
            
            setElements(tempEle)
          }
            
        }

        const onMouseUp = (e) => {
          if(action === 'none'){
            return
          }
          // console.log(elements)
          const {clientX, clientY} = e

          if(tool === 'brush'){
            setPoints(prev => [...prev, [clientX,clientY]])
            const outlinePoints = getStroke(points)
            const pathData = getSvgPathFromStroke(outlinePoints)
            const newSvg = generator.svg(pathData,options)

            setElements(prev => [...prev, newSvg])
            setPoints(null)
          }
          
          else{

            const tempEle = [...elements]
            const n = tempEle.length-1
            
            const {x1,y1} = tempEle[n]
            
            const temp = new Shape(ctx)
            const finalEle = drawElement(temp,tool,x1,y1,clientX,clientY)
            
            tempEle[n] = finalEle
            
            setElements(tempEle)
            
          }
          setAction('none')
          return
          // console.log(e.clientX,e.clientY)
        }

        canvas.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        canvas.addEventListener('mousemove', onMouseMove)

        return() => {
          canvas.removeEventListener('mousedown', onMouseDown)
          document.removeEventListener('mouseup', onMouseUp)
          canvas.removeEventListener('mousemove', onMouseMove)

        }

    },[action,elements,points])

  return (
    <>
    <div className='absolute z-10'>
      <button onClick={()=>setTool('brush')} className='m-2'>brush</button>
      <button onClick={()=>setTool('rectangle')} className='m-2'>rectangle</button>
      <button onClick={()=>setTool('line')} className='m-2'>line</button>
      <button onClick={()=>setTool('ellipse')} className='m-2'>ellipse</button>
    </div>
      <canvas ref={canvasRef} id='canvas' height={window.innerHeight} width={window.innerWidth} className=' relative bg-zinc-800'></canvas>

    </>
  )
}

export default Canvas