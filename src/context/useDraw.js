import { createContext, useContext, useState } from "react";

export const DrawContext = createContext({
    elements: [],
    setElements: () => {},
    currentTool: 'pen',
    setCurrentTool: () => {},
    strokeWidth: '5',
    setStrokeWidth: () => {},
    roughness: '0',
    setRoughness: () => {},
    stroke: '#000000',
    setStroke: () => {},
    elementHistory: [],
    setElementHistory: () => {},
    isMoving: [],
    setMoving: () => {},
    scale: 1,
    setScale: () => {},
    canvasRef: null,


})

export const DrawProvider = DrawContext.Provider

export default function useDraw() {
    return useContext(DrawContext)
}