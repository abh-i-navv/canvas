
import { useRef,useEffect,useState } from 'react'
import { Shape } from '../utils/Shape';
import { getStroke } from 'perfect-freehand'
import { getSvgPathFromStroke } from '../utils/getSvgPathFromStroke';
import useDraw from '../context/useDraw';
import SelectionBox from './SelectionBox';
import { Transform } from '../utils/Transform';
import { svgPathToPointsArray } from '../utils/svgPathToPoints';


function Canvas() {
    // const canvasRef = useRef(null)
    const inputRef = useRef(null)
    // const [elements,setElements] = useState([])
    const [tool, setTool] = useState('none')
    const [action, setAction] = useState('none')
    const [points,setPoints] = useState([])
    const [movingElement, setMovingElement] = useState(null)
    const [selectedElement, setSelectedElement] = useState(null)
    const [currText, setCurrText] = useState('')
    const [initialPoints, setInitialPoints] = useState({x:0, y:0})
    const [currElement, setCurrElement] = useState(null)
    const [panOffset, setPanOffset] = useState({x:0, y:0})
    const [scaleOffset,setScaleOffset] = useState({x:0, y:0})
    const [currCanvas, setCurrCanvas] = useState(null)
    // const [isResizing, setIsResizing]= useState(false)

    const {elements, setElements,strokeWidth,setStrokeWidth,stroke,setStroke, setRoughness,
      roughness, currentTool,setCurrentTool,elemenHistory, setElementHistory, isMoving, setMoving,scale, setScale,canvasRef} = useDraw()
  
      
      useEffect(()=>{
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.height = window.innerHeight
        ctx.width = window.innerWidth
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        const options = {
          strokeStyle: stroke,
          lineWidth: strokeWidth,
          lineJoin: "bevel",
          panOffset: panOffset
        } 
        const generator = new Shape(ctx,options)

        const scaleWidth = canvas.width * scale
        const scaleHeight = canvas.height * scale
        const scaleOffsetX = (scaleWidth - canvas.width)/2
        const scaleOffsetY = (scaleHeight - canvas.height)/2
        setScaleOffset({x:scaleOffsetX, y:scaleOffsetY})

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        // ctx.translate(panOffset.x*scale - scaleOffsetX, panOffset.y*scale -scaleOffsetY)
        
        // ctx.scale(scale,scale)       
        // ctx.transform(scale, 0, 0, scale, panOffset.x*scale - scaleOffsetX, panOffset.y*scale -scaleOffsetY)
        
        const t = new Transform()
        t.translate(panOffset.x*scale - scaleOffsetX, panOffset.y*scale -scaleOffsetY)
        t.scale(scale,scale)
        const test = t.copy()
        generator.transform(test)

        // console.log(test)

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

        //mouse down event
        const onMouseDown = (e) => {
          e.preventDefault()
          if(currentTool === 'none'){
            return
          }

          if(!e){
            return
          }
          // const {clientX, clientY} = e

          // calculating the coordinates with reference to canvas
          let x = (e.clientX - panOffset.x*scale + scaleOffsetX)/scale 
          let y = (e.clientY - panOffset.y*scale + scaleOffsetY)/scale
          ctx.save()

          if(e.type === 'touchstart'){
            x = (e.touches[0].clientX - panOffset.x*scale + scaleOffsetX)/scale 
            y = (e.touches[0].clientY - panOffset.y*scale + scaleOffsetY)/scale
          }

          if(currentTool === 'text'){
            setAction("typing")
            setSelectedElement(null)
            //creating element for text box
            const temp = new Shape(ctx)
            const finalEle = temp.textBox(x,y,currText,options)
            setElements(prev => [...prev, finalEle])
            finalEle.realX = e.clientX
            finalEle.realY = e.clientY
            // console.log(finalEle)
            setCurrElement(finalEle)

          }
          else if(currentTool === 'move'){
            setAction('moving')

            if(elements){
    
              //getting the element at the point x,y
              const currElement = findElement(x,y, elements)  
              if(currElement){
                currElement.gen = generator
                setSelectedElement(currElement)

                
                if(currElement.type ==='svg'){
                  const {pointsArr} = currElement
                  setPoints(pointsArr)
                  let offsetX = pointsArr.map(point => x - point[0]) 
                  let offsetY = pointsArr.map(point => y - point[1])  
                  
                  setMovingElement([currElement,offsetX,offsetY,x,y])
                }
                else if(currElement.type === 'text'){
                  const offsetX = x-currElement.x
                  const offsetY = y-currElement.y
                  setMovingElement([currElement,offsetX,offsetY])
                }
                else{
                  const offsetX = x-currElement.x1
                  const offsetY = y-currElement.y1
                  setMovingElement([currElement,offsetX,offsetY]) //Data of selected element at point x,y
                }
                
              }
            }


          }
          else if(currentTool === 'pan'){
            setAction('panning')
            setInitialPoints({x:x, y:y})
          }
          else{

            setAction('drawing')
            if(currentTool === 'brush'){
              const pts = [[x,y]]
              setPoints(pts)
              
              
              const newSvg = drawSVG(points,ctx,options)
              
              setElements(prev => [...prev, newSvg])
              setCurrElement(newSvg)
              
            }
            else{
              const temp = new Shape(ctx,options)
              setCurrCanvas(temp)
              // temp.reset()
              // temp.transform(test)
              const l = drawElement(temp,currentTool,x,y,x,y,options,strokeWidth)
              
              setElements(prev => [...prev,l])
              setCurrElement(l)
              
              return
            }
          }
             
        }

        const onMouseMove = (e) => {
          e.preventDefault()
          // const {clientX, clientY} = e

          // calculating the coordinates with reference to canvas
          let x = (e.clientX - panOffset.x*scale + scaleOffsetX)/scale 
          let y = (e.clientY - panOffset.y*scale + scaleOffsetY)/scale
          
          if(e.type === 'touchstart'){
            x = (e.touches[0].clientX - panOffset.x*scale + scaleOffsetX)/scale 
            y = (e.touches[0].clientY - panOffset.y*scale + scaleOffsetY)/scale
          }

          if(action === 'none' || action === "typing" || currentTool === 'none'){
            return
          }
          else if(currentTool === 'pan' && action === 'panning'){
            setPanOffset(prev => ({x:prev.x+(x-initialPoints.x), y:prev.y + (y-initialPoints.y)}))
            return
          }
          else if(currentTool === 'move' && action === 'moving'){
            
            if(!movingElement)  return
            const type = movingElement[0].type // geting shape type
            if(!type) return
            
            const {id} = movingElement[0]
            let n;
            elements.find((el,idx) => {
              if(el.id === id){
                n= idx
              }
            })

            if(type === 'svg'){
              
              const updateEle = [...elements]
              
              // let pts = [...points]
              // // console.log(updateEle[n])
            
              let offsetX = movingElement[1]
              let offsetY = movingElement[2]
              let x1 = movingElement[3]
              let y1 = movingElement[4]

              const newEle = {...selectedElement}

              ctx.save()

              const re = {
                type: "translate",
                x:x-x1,
                y:y-y1
              }
              newEle.resize = re
              // console.log(newEle)
              // generator.draw([newEle])

              // generator.move(x-x1,y-y1,newEle)

              // ctx.transform(1, 0, 0, 1, x-x1, y-y1)
              // ctx.translate(x-x1,y-y1)
              // console.log(x+offsetX[0],y+offsetY[0])
              
              // generator.draw([selectedElement])

              ctx.restore()

              // console.log(selectedElement)
              
              // for(let  i=0; i < pts.length; i++){
              //   pts[i][0] = x-offsetX[i]
              //   pts[i][1] = y-offsetY[i]
              // }              

              // const newSvg = drawSVG(pts,ctx,options)
              
              updateEle[n] = newEle
              setElements(updateEle)
              generator.draw(elements)
              // console.log(selectedEle,pts)

              // setPoints(pointsArr)
              // updateElement(id-1,type,pointsArr[0][0],pointsArr[0][1],pointsArr[1][0], pointsArr[1][1], options,pointsArr)
              
            }
            
           if(type && type != 'svg'){
              const newX = (x-movingElement[1])
              const newY = (y-movingElement[2])

                const {id,type, x1,y1,x2,y2} = movingElement[0]
                // console.log(id)
                

                const updateEle = [...elements]
                const selectedEle = updateEle[n]
                
                if(type === 'text'){
                  
                  selectedEle.x = newX
                  selectedEle.y= newY
                }

                else{
                  selectedEle.x1 = newX
                  selectedEle.y1= newY
                  selectedEle.x2 = newX+x2-x1
                  selectedEle.y2 = newY+y2-y1
                }
                
                setElements(updateEle)
                
              }

          }
          else if(action === 'drawing'){

            if(currentTool === 'brush' && action === 'drawing'){
              setPoints(prev => [...prev, [x,y]])
              setSelectedElement(null)
              if(!elements){
                return
              }
              const newSvg = drawSVG(points,ctx,options)
              const n = elements.length-1
              
              const updateEle = [...elements]
              updateEle[n] = newSvg
              setElements(updateEle)
              // generator.draw(elements)
            }
            else if(action === 'drawing'){
              setSelectedElement(null)
              const tempEle = [...elements]
              const n = tempEle.length-1
              
              const {x1,y1,options} = tempEle[n]
              const temp = new Shape(ctx,options)
              
              const finalEle = drawElement(temp,currentTool,x1,y1,x,y,options)
              tempEle[n] = finalEle
              setElements(tempEle)
              
            }          
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            
            ctx.save()
            
            const t = new Transform()
            t.translate(panOffset.x*scale - scaleOffsetX, panOffset.y*scale -scaleOffsetY)
            t.scale(scale,scale)
            const test = t.copy()
            generator.transform(test)
            
            generator.draw(elements);
            
            ctx.restore()
            
          }
            
        }

        const onMouseUp = (e) => {
          e.preventDefault()
          if(action === 'none'){
            return
          }
          setMovingElement(null)
          ctx.restore()
          
          // const {clientX, clientY} = e

          // calculating the coordinates with reference to canvas
          let x = (e.clientX - panOffset.x*scale + scaleOffsetX)/scale 
          let y = (e.clientY - panOffset.y*scale + scaleOffsetY)/scale
          
          if(e.type === 'touchstart'){
            x = (e.touches[0].clientX - panOffset.x*scale + scaleOffsetX)/scale 
            y = (e.touches[0].clientY - panOffset.y*scale + scaleOffsetY)/scale
          }


          if(currentTool === 'text'){
            return
          }
          if(currentTool !== 'move'){
            setSelectedElement(null)
          }
          
          if(action === 'drawing'){

            if(currentTool === 'brush'){
              setPoints(prev => [...prev, [x,y]])
              
              const newSvg = drawSVG(points,ctx,options)
              const n = elements.length-1
              
              const updateEle = [...elements]
              updateEle[n] = newSvg
              setElements(updateEle)
              setPoints([])
            }
            
            else{
              
              const tempEle = [...elements]
              const n = tempEle.length-1
              
              const {type,x1,y1,options} = tempEle[n]
              
              const temp = new Shape(ctx)
              // let finalEle

              // if (type === "rectangle") {
              //   const minX = Math.min(x1, x);
              //   const maxX = Math.max(x1, x);
              //   const minY = Math.min(y1, y);
              //   const maxY = Math.max(y1, y);
              //   finalEle = drawElement(temp,currentTool, minX,minY,maxX,maxY,options)

              // } else {
              //   if (x1 < x || (x1 === x && y1 < y)) {
              //     finalEle = drawElement(temp,currentTool, x, y, x1, y1,options)
              //   } else {
              //     finalEle = drawElement(temp,currentTool, x1, y1, x, y,options)
              //   }
              // }

              let finalEle
              // console.log(tempEle[n])
              if(y < y1){
                finalEle = drawElement(temp,currentTool,x,y,x1,y1,options)

              }
              else{
                finalEle = drawElement(temp,currentTool,x1,y1,x,y,options)
              }
              // console.log(finalEle)
              
              tempEle[n] = finalEle
              
              setElements(tempEle)
              
            }
          }
            setPoints([])
            setAction('none')
          return
        }

        localStorage.setItem('elements', JSON.stringify(elements))

        const onKeyDown = (e) => {
          if(action !== 'typing'){
            return
          }

          if(e.key === 'Enter'){
            const temp = new Shape(ctx)
            const n = elements.length-1
            
            const currEle = [...elements]
            const {x,y,options} = currEle[n]
            const finalEle = temp.textBox(x,y+40,currText,options)

            currEle[n] = finalEle
            setElements(currEle)

            setAction('none')
            setCurrText('')
            return
          }
        }

        const handleResize= (e) =>{
          const storageEle = JSON.parse(localStorage.getItem('elements'))
          
          setElements(storageEle)
          localStorage.clear()
          
        }

        canvas.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        canvas.addEventListener('mousemove', onMouseMove)
        document.addEventListener('keydown', onKeyDown)
        window.addEventListener("resize", handleResize)
      
        return() => {
          canvas.removeEventListener('mousedown', onMouseDown)
          document.removeEventListener('mouseup', onMouseUp)
          canvas.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('keydown', onKeyDown)
          window.removeEventListener("resize", handleResize)

        }

    },[action,elements,points,currText, currElement, currentTool,scale,strokeWidth,panOffset,stroke])

    // panOffset,elements,currentTool,action,scale
    // action,elements,points,currText, currElement, currentTool,scale,strokeWidth,panOffset,stroke

    useEffect(() => {
      const textInput = inputRef.current
      if(!textInput)  return
      if(action === 'typing'){
        textInput.focus()
        // const n = elements.length-1
        // const {x,y} = elements[n]

        // textInput.style.top = y
        // textInput.style.left = x
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
          <input ref={inputRef} className={`bg-white w-auto fixed h-10 border-none focus:outline-none font-serif text-4xl`}
           style={{color: stroke ,top:currElement.realY, left:currElement.realX, width: currText.length > 21 ? currText.length*20 : '394px'}}
           onChange={handleChange} />

      }
      {
        selectedElement && <SelectionBox selectedElement={selectedElement} />
      }
      

      <canvas ref={canvasRef} id='canvas' height={window.innerHeight} width={window.innerWidth} className=' relative'>
      </canvas>

    </>
  )
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

const drawSVG = (pts,ctx,options) => {
  if(!pts || !ctx){
    return
  }
  const thickness=  options.lineWidth >5 ? options.lineWidth : 5
  
  const outlinePoints = getStroke(pts,{size: thickness})
  const pathData = getSvgPathFromStroke(outlinePoints)
  const temp = new Shape(ctx)
  return temp.svg(pathData,pts,options)
}

function cartesianDistance(x1,y1, x2,y2){
  return Math.round((Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2))))
}

 // for finding if a element exists on the given point
 const elementFinder = (x,y,element) => {
  const {x1,y1,x2,y2,type} = element

  // Line -> AB, to check if a point P lies on line => dist(AB) = dist(AP) + dist(PB)
  if(type === 'line'){
    const lineDist = cartesianDistance(x1,y1,x2,y2)
    const pointDist = cartesianDistance(x,y,x1,y1) + cartesianDistance(x,y,x2,y2)
    if( lineDist === pointDist){
      return element
    }
  }
  
  // checking for rectangle and ellipse
  else if(type === 'rectangle' || type === 'ellipse'){
    const maxX = Math.max(x1,x2)
    const maxY = Math.max(y1,y2)
    const minX = Math.min(x1,x2)
    const minY = Math.min(y1,y2)
    
    // if(action === 'erasing'){
    //   if((x <= maxX+10 && x >= minX-10 && y<= maxY+10 && y>=minY-10) &&
    //     ((Math.abs(x-minX) < 10 && y<=maxY && y>=minY) || (Math.abs(x-maxX) < 10 && y<=maxY && y>=minY) || 
    //     (Math.abs(y-minY) < 10 && x<=maxX && x>=minX) || (Math.abs(y-maxY) < 10 && x<=maxX && x>=minX))){
    //     return element
    //   }
    // }
    {          
      if(x <= maxX && x >= minX && y<= maxY && y>=minY){
        
        return element
      }
      
    }
  }

  //if point P lies inside triangle => area(ABC) = area(PAB) + area(PAC) + area(PBC)
  else if(type === 'triangle'){
    const {pts} = element
    const A = pts[0]
    const B = pts[1]
    const C = pts[2]
    const P = [x,y]

    const area = (x1,y1,x2,y2,x3,y3) => {
      // Area A = [ x1(y2 – y3) + x2(y3 – y1) + x3(y1-y2)]/2 
      return Math.abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2.0)
    }
    const originalArea = area(A[0],A[1],B[0],B[1],C[0],C[1])
    const testArea = area(P[0],P[1],A[0],A[1],B[0],B[1]) + area(P[0],P[1],B[0],B[1],C[0],C[1]) + area(P[0],P[1],A[0],A[1],C[0],C[1])

    if(originalArea === testArea) return  element
  }

  else if(type=== 'rhombus'){
    const {pts} = element

    function inside(point, vs) {
      // ray-casting algorithm based on
      // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
      
      var x = point[0], y = point[1];
      
      var inside = false;
      for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          var xi = vs[i][0], yi = vs[i][1];
          var xj = vs[j][0], yj = vs[j][1];
          
          var intersect = ((yi > y) != (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
      
      return inside;
  }

    if(inside([ x, y ], pts)){
      return element
    }
  }
  else if(type === 'svg'){
    
    const {pointsArr,path} = element
    const newArr = svgPathToPointsArray(path)
    console.log(element)
    
    for(let i =0; i<newArr.length; i++){
      
      const currX = newArr[i][0]
      const currY = newArr[i][1]
      
      if(Math.abs(currX-x) <=10 && Math.abs(currY-y) <= 10){
        const obj = {element:element, X: currX, Y: currY}
        return obj        
      }
    }

  }

  else if(type === 'text'){
    const elX = element.x
    const elY = element.y-40

    const x1 = elX
    const y1 = elY
    const x2 = elX+element.width
    const y2 = elY+40
    
    const maxX = Math.max(x1,x2)
    const maxY = Math.max(y1,y2)
    const minX = Math.min(x1,x2)
    const minY = Math.min(y1,y2)

    if(x <= maxX && x >= minX && y<= maxY && y>=minY){
      return element
    }
  }
  
}

//looping through each element and checking if point P lies on the element
const findElement = (x,y,elements) => {
  return (elements.find(element => elementFinder(x,y,element)))
}

export default Canvas