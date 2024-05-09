import React, { useEffect, useRef, useState } from 'react'
import useDraw from '../context/useDraw';
import { FaPen } from "react-icons/fa";
import { MdOutlineRectangle } from "react-icons/md";
import { MdOutlineClear } from "react-icons/md";
import { IoEllipseOutline } from "react-icons/io5";
import { GoDiamond } from "react-icons/go";
import { IoTriangleOutline } from "react-icons/io5";
import { LuEraser } from "react-icons/lu";
import { LuUndo2 } from "react-icons/lu";
import { LuRedo2 } from "react-icons/lu";
import { RiDragMove2Fill } from "react-icons/ri";
import { MdPanTool } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { IconContext } from 'react-icons';
import { FaMousePointer } from "react-icons/fa";
import { MdOutlineHorizontalRule } from "react-icons/md";
import SideBar from './SideBar';


function ToolBar() {
  const {currentTool,setCurrentTool,strokeWidth,setStrokeWidth,stroke,setStroke, setRoughness,
    roughness,setElements,elements,elementHistory, setElementHistory,scale, setScale,canvasRef} = useDraw()
 

  function Clear(e){
    setElementHistory([])
    const ele = elements
    
    setElementHistory(ele)
    setElements([])
    
  }

  function Undo(){
    if(elements.length != 0){

      let elementCopy = elements
      const lastElement = elementCopy.pop()
      
      setElementHistory(prev => [...prev, lastElement])
      setElements((elements) => [...elements])
    }
  }

  function Redo(){
      if(elementHistory.length != 0){
        
          let redoElement = elementHistory.pop()
          
          setElements((prev) => [...prev,redoElement])
          setElementHistory((prev) => [...prev])
      }
      else {
        return
      }

  }



  return (
    <>
      <SideBar></SideBar>
    

    <div className='hidden lg:flex absolute top-0 border-2 border-[#322560] z-10 bg-[#fafafa] rounded-xl mt-2 shadow-md'>
        {/* <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'moving' ? 'bg-[#b3aad5]' : ''} `} onClick={() => {setCurrentTool('moving')}}>
          <RiDragMove2Fill />
        </div> */}
        <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'move' ? 'bg-[#b3aad5]' : ''}`} onClick={() => {setCurrentTool('move')}}>
          <FaMousePointer />
        </div>
        {/* <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'pan' ? 'bg-[#b3aad5]' : ''}`} onClick={() => {setCurrentTool('pan')}}>
          <MdPanTool />
        </div> */}
        <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'text' ? 'bg-[#b3aad5]' : ''}`} onClick={() => {setCurrentTool('text')}}>
          Text
        </div>

        <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'brush' ? 'bg-[#b3aad5]' : ''}`} onClick={()=>{setCurrentTool('brush')}} >
          <FaPen />
        </div>
        <IconContext.Provider value= {{size: "1.3em"}}>

          <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'line' ? 'bg-[#b3aad5]' : ''}`} onClick={()=>{setCurrentTool('line')}}>
            <MdOutlineHorizontalRule />
          </div>
          <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'rectangle' ? 'bg-[#b3aad5]' : ''} `} onClick={()=>{setCurrentTool('rectangle')}}>
            <MdOutlineRectangle  />
          </div>
          <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'ellipse' ? 'bg-[#b3aad5]' : ''}`} onClick={()=>{setCurrentTool('ellipse')}}>
            <IoEllipseOutline  />
          </div>
          {/* <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'rhombus' ? 'bg-[#b3aad5]' : ''}`} onClick={()=>{setCurrentTool('rhombus')}}>
            <GoDiamond  />
          </div>
          <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'triangle' ? 'bg-[#b3aad5]' : ''}`} onClick={()=>{setCurrentTool('triangle')}}>
            <IoTriangleOutline  />
          </div>
          <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#b3aad5] ${currentTool === 'eraser' ? 'bg-[#b3aad5]' : ''}`} onClick={()=>{setCurrentTool('eraser')}}>
            <LuEraser  />
          </div>         */}
          <div className={`cursor-pointer m-2 p-2 flex items-center justify-center hover:bg-[#c49898]`} 
          onClick={Clear}>
            <MdOutlineClear />
          </div>
        </IconContext.Provider>

        <div className='flex flex-col items-center m-2'>
            <span className='justify-center select-none'>Width</span>
            <input type='range' min={1} max={30} value={strokeWidth} className='w-20 bg-[#7566b0]' onChange={(e) => {setStrokeWidth(e.target.value)}} ></input>
        </div>
        

        <div className='flex justify-center items-center m-2'>
          <input type='color' value={stroke} onChange={(e) => {setStroke(e.target.value)}}></input>
        </div>
    </div>
    <div className='flex absolute top-0 right-0 ' >
    <div className='m-2 border-[#322560] border-2 cursor-pointer rounded-lg hover:bg-[#b3aad5] z-10' onClick={Undo} >
      <LuUndo2 className='' size={30}/>
    </div>

    <div className='m-2 cursor-pointer border-[#322560] border-2 rounded-lg hover:bg-[#b3aad5] z-10' onClick={Redo}>
      <LuRedo2 className='' size={30}/>
    </div>
    </div>

    {/* <div className='flex absolute bottom-5 right-5' >
    <div className='m-2 border-[#322560] border-2 cursor-pointer rounded-lg hover:bg-[#b3aad5] z-10' onClick={() => setScale(prev => Math.max((prev-0.1),0.2))} >
      <FaMinus className='' size={20}/>
    </div>

    <div className='m-2 cursor-pointer border-[#322560] border-2 rounded-lg hover:bg-[#b3aad5] z-10' onClick={() => setScale(prev => Math.min((prev+0.1),2.5))}>
      <FaPlus className='' size={20}/>
    </div>
    </div> */}


    </>
  )
}

export default ToolBar