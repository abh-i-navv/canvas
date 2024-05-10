import React, { useEffect, useState } from 'react'
import { Transform } from '../utils/Transform'
import useDraw from '../context/useDraw'

export default function SelectionBox({selectedElement}) {

  const {elements, setElements,canvasRef} = useDraw()

    const [isResizing, setIsResizing]= useState(false)
    const [action, setAction] = useState('none')
    const [cords, setCords] = useState(null)

    const {id,x1,y1,y2,x2,gen} = selectedElement

    let n;
    elements.find((el,idx) => {
      if(el.id === id){
        n= idx
      }
    })

    const t = new Transform()

    const handleVerticalResize = (e) => {
        console.log(selectedElement)
        selectedElement.y1 += 10
        const updateEle = [...elements]
        updateEle[n] = selectedElement

        setElements(elements)

    }

    const handleHorizontalResize = (e) => {

    }

    useEffect(() => {

      const canvas = canvasRef.current
      
      if(!canvas) return
      const onMouseDown = (e) =>{
        if(!isResizing) return
        // console.log(1)
        // setAction('resizing')
        // const {clientX, clientY} = e
        // setCords([clientX,clientY])
        
        gen.ctx.save()

        
        // gen.ctx.scale(2,1)
        // console.log(selectedElement)
        const testEle = {...selectedElement}
        console.log(testEle)
        delete testEle.gen
        
        gen.move(10,10,testEle)

        gen.ctx.restore()

        const updateEle= [...elements]
        // const newEle = selectedElement
        updateEle[n] = testEle
        setElements(updateEle)
        gen.draw(elements)

        // gen.ctx.restore()
        // gen.ctx.setTransform(1, 0, 0, 1, 0, 0);
        

      //   [
          // 6.123233995736766e-17,
          // 1,
          // -1,
          // 6.123233995736766e-17,
          // 0,
          // 0
      // ]


      }

      const onMouseMove = (e) => {
        if(action !== 'resizing' && isResizing === false) return
        // const {clientX, clientY} = e
        // console.log(1)
        // selectedElement.y1 = selectedElement.y1+ cords[1]-clientY
        // console.log(cords[1]-clientY)
        // const updateEle = [...elements]
        // updateEle[n] = selectedElement

        // setElements(elements)

      }

      const onMouseUp = (e) => {
        setIsResizing(false)
        setAction('none')
      }


      document.addEventListener('mousedown', onMouseDown)
      document.addEventListener('mouseup', onMouseUp)
      document.addEventListener('mousemove', onMouseMove)
      
        return() => {
          document.removeEventListener('mousedown', onMouseDown)
          document.removeEventListener('mouseup', onMouseUp)
          document.removeEventListener('mousemove', onMouseMove)

        }

    }, [isResizing, elements,cords])


  return (
    <>
        <div 
        style={{top:y1-12, left:x1+Math.abs(x1-x2)/2, 
        width: 5, height: 5}}
        className={` bg-blue-600 cursor-ns-resize fixed z-10`}
        onClick={()=>setIsResizing(true)}
        ></div>

        <div 
        style={{top: y1+Math.abs(y1-y2)/2, left: x2+6, 
        width: 5, height: 5}}
        className={` bg-blue-600 cursor-ew-resize fixed z-10`}
        onClick={()=>setIsResizing(true)}></div>


        <div style={{top:y1-10, left:x1-10, 
        width: (Math.abs(x1 - x2)+20 ), height: (Math.abs(y1 - y2)+20)}}
        className={` border-[2px] border-blue-500 fixed`}></div>
    </>
  )
}
