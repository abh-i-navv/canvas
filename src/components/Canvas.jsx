
import { useRef,useEffect,useState } from 'react'
import { Shape } from '../utils/Shape';
import { getStroke } from 'perfect-freehand'
import { getSvgPathFromStroke } from '../utils/getSvgPathFromStroke';
import useDraw from '../context/useDraw';


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

const drawSVG = (pts,ctx,options) => {
  if(!pts || !ctx){
    return
  }
  const outlinePoints = getStroke(pts,{size: 12})
  const pathData = getSvgPathFromStroke(outlinePoints)
  const temp = new Shape(ctx)
  return temp.svg(pathData,options)
}


function Canvas() {
    // const canvasRef = useRef(null)
    const inputRef = useRef(null)
    // const [elements,setElements] = useState([])
    const [tool, setTool] = useState('none')
    const [action, setAction] = useState('none')
    const [points,setPoints] = useState([])
    const [currText, setCurrText] = useState('')
    const [currElement, setCurrElement] = useState(null)
    const [panOffset, setPanOffset] = useState({x:0, y:0})
    const [scaleOffset,setScaleOffset] = useState({x:0, y:0})

    const {elements, setElements,strokeWidth,setStrokeWidth,stroke,setStroke, setRoughness,
      roughness, currentTool,setCurrentTool,elemenHistory, setElementHistory, isMoving, setMoving,scale, setScale,canvasRef} = useDraw()
  
    

    useEffect(()=>{
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.height = window.innerHeight
        ctx.width = window.innerWidth

        ctx.clearRect(0,0,canvas.width,canvas.height);

        const options = {
          strokeStyle: "black",
          lineWidth: 5,
          lineJoin: "bevel"
        }
       

        const generator = new Shape(ctx)

        // var pts=[ [5,5], [100,50], [150,200], [60,500]];
        // const poly = generator.polygon(pts,options)
        // const circle = generator.circle(500,500,100,options)
        // const rect = generator.rectangle(200,200, 400, 400, options,)
        // const rect = generator.rectangle(597,217,825,366,options)
        // ctx.clearRect(0,0,canvas.width, canvas.height)
        // generator.textBox(100,100, "Hello world")
        
        // console.log(elements)
        generator.draw(elements)
        ctx.restore()
        
        const onMouseDown = (e) => {
          e.preventDefault()
          if(currentTool === 'none'){
            return
          }
          e.preventDefault()
          setAction("drawing")
          if(!e){
            return
          }
          const {clientX, clientY} = e

          if(currentTool === 'text'){
            setAction("typing")
            
            //creating element for text box
            const temp = new Shape(ctx)
            const finalEle = temp.textBox(clientX,clientY,currText)
            setElements(prev => [...prev, finalEle])
            setCurrElement(finalEle)

          }
          
          else if(currentTool === 'brush'){
            const pts = [[clientX,clientY]]
            setPoints(pts)


            const newSvg = drawSVG(points,ctx,options)
            console.log(newSvg)

            setElements(prev => [...prev, newSvg])
            setCurrElement(newSvg)

          }
          else{

            const temp = new Shape(ctx,options)
            
            const l = drawElement(temp,currentTool,clientX,clientY,clientX,clientY,options)
            
            setElements(prev => [...prev,l])
            setCurrElement(l)
            
            return
          }
             
        }
        
        

        const onMouseMove = (e) => {
          e.preventDefault()
          const {clientX, clientY} = e

          if(action === 'none' || action === "typing"){
            return
          }
          
          if(currentTool === 'brush'){
            setPoints(prev => [...prev, [clientX,clientY]])
            
            if(!elements){
              return
            }

            const newSvg = drawSVG(points,ctx,options)
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
            const finalEle = drawElement(temp,currentTool,x1,y1,clientX,clientY)
            
            tempEle[n] = finalEle
            
            setElements(tempEle)
          }
            
        }

        const onMouseUp = (e) => {
          e.preventDefault()
          if(action === 'none'){
            return
          }
          
          const {clientX, clientY} = e

          if(currentTool === 'text'){
            return
          }

          if(currentTool === 'brush'){
            setPoints(prev => [...prev, [clientX,clientY]])

            const newSvg = drawSVG(points,ctx,options)
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
            const finalEle = drawElement(temp,currentTool,x1,y1,clientX,clientY)
            
            tempEle[n] = finalEle
            
            setElements(tempEle)
            
          }
          setAction('none')
          return
        }

        const onKeyDown = (e) => {
          if(action !== 'typing'){
            return
          }

          if(e.key === 'Enter'){
            const temp = new Shape(ctx)
            const n = elements.length-1
            
            const currEle = [...elements]
            const {x,y} = currEle[n]
            const finalEle = temp.textBox(x,y+40,currText)

            currEle[n] = finalEle
            setElements(currEle)

            setAction('none')
            setCurrText('')
            return
          }
        }

        canvas.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        canvas.addEventListener('mousemove', onMouseMove)
        document.addEventListener('keydown', onKeyDown)

        return() => {
          canvas.removeEventListener('mousedown', onMouseDown)
          document.removeEventListener('mouseup', onMouseUp)
          canvas.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('keydown', onKeyDown)

        }

    },[action,elements,points,currText, currElement, currentTool,scale])

    useEffect(() => {
      const textInput = inputRef.current
      if(!textInput)  return
      if(action === 'typing'){
        textInput.focus()
        const n = elements.length-1
        const {x,y} = elements[n]

        textInput.style.top = y
        textInput.style.left = x
      }
    }, [action,currElement])

    const handleChange = (e) => {
        setCurrText(e.target.value)
    }

  return (
    <>
    {/* <div className='absolute z-10 bg-zinc-500 left-[50%]'>
      <div>

        <button onClick={()=>setTool('brush')} className='m-2 text-white'>brush</button>
        <button onClick={()=>setTool('text')} className='m-2 text-white'>text</button>
        <button onClick={()=>setTool('rectangle')} className='m-2 text-white'>rectangle</button>
        <button onClick={()=>setTool('line')} className='m-2 text-white'>line</button>
        <button onClick={()=>setTool('ellipse')} className='m-2 text-white'>ellipse</button>
      </div>
    </div> */}
      {
        action === 'typing' && 
          <input ref={inputRef} className={`bg-white w-auto h-10 z-10 border-none focus:outline-none font-serif text-4xl`}
           style={{top:currElement.y, left:currElement.x, width: currText.length > 21 ? currText.length*20 : '394px'}}
           onChange={handleChange} />

      }
      <canvas ref={canvasRef} id='canvas' height={window.innerHeight} width={window.innerWidth} className=' relative'>
      </canvas>

    </>
  )
}

export default Canvas