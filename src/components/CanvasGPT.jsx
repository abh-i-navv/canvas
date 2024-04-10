
import { useRef,useEffect,useState } from 'react'

// Declaration
class Shape {
    constructor(ctx, options) {
        this.ctx = ctx;
        this.options = options;
        this.elements = [];
    }

    getElements() {
        return this.elements;
    }

    addElement(element) {
        this.elements.push(element);
    }

    style(options) {
        if (!this.ctx) {
            return;
        }
        if (options) {
            for (let [key, value] of Object.entries(options)) {
                if (key in this.ctx) {
                    this.ctx[key] = value;
                }
            }
        }
        return this; // Enable method chaining
    }

    rectangle(x1, y1, x2, y2, options) {
        if (!this.ctx || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            return;
        }
        this.style(options);

        this.ctx.beginPath();
        this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        const ele = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            type: "rectangle",
            options: (options ? options : this.options)
        };
        this.addElement(ele);
        return this; // Enable method chaining
    }

    line(x1, y1, x2, y2, options) {
        if (!this.ctx || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            return;
        }
        this.style(options);

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.closePath();
        this.ctx.stroke();
        const ele = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            type: "line",
            options: (options ? options : this.options)
        };
        this.addElement(ele);
        return this; // Enable method chaining
    }

    circle(x, y, radius, options) {
        if (!this.ctx || isNaN(x) || isNaN(y) || isNaN(radius)) {
            return;
        }
        this.style(options);

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        this.ctx.stroke();
        const ele = {
            x: x,
            y: y,
            radius: radius,
            type: "circle",
            options: (options ? options : this.options)
        };
        this.addElement(ele);
        return this; // Enable method chaining
    }

    ellipse(x, y, width, height, options) {
        if (!this.ctx || isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
            return;
        }
        this.style(options);

        this.ctx.beginPath();
        this.ctx.ellipse(x, y, Math.abs(width), Math.abs(height), 0, 0, 2 * Math.PI);
        this.ctx.stroke();
        const ele = {
            x: x,
            y: y,
            width: width,
            height: height,
            type: "ellipse",
            options: (options ? options : this.options)
        };
        this.addElement(ele);
        return this; // Enable method chaining
    }

    polygon(pts, options) {
        if (!this.ctx || !Array.isArray(pts) || pts.length < 3) {
            return;
        }
        this.style(options);

        this.ctx.beginPath();
        this.ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
            this.ctx.lineTo(pts[i][0], pts[i][1]);
        }
        this.ctx.closePath();
        this.ctx.stroke();

        const ele = {
            points: pts,
            type: "polygon",
            options: (options ? options : this.options)
        };
        this.addElement(ele);
        return this; // Enable method chaining
    }

    draw() {
        this.elements.forEach((el) => {
            switch (el.type) {
                case "rectangle":
                    this.rectangle(el.x1, el.y1, el.x2, el.y2, el.options);
                    break;
                case "line":
                    this.line(el.x1, el.y1, el.x2, el.y2, el.options);
                    break;
                case "circle":
                    this.circle(el.x, el.y, el.radius, el.options);
                    break;
                case "ellipse":
                    this.ellipse(el.x, el.y, el.width, el.height, el.options);
                    break;
                case "polygon":
                    this.polygon(el.points, el.options);
                    break;
                default:
                    break;
            }
        });
    }

    render() {
            // Clear the elements array before drawing
            this.elements = [];
        
            this.draw();
        }
        
    
}


function CanvasGPT() {
    const canvasRef = useRef(null);
    const [elements, setElements] = useState([]);
    const [action, setAction] = useState('none');
    const [currentShape, setCurrentShape] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const options = {
            strokeStyle: "green",
            lineWidth: 5,
            lineJoin: "bevel"
        };

        const generator = new Shape(ctx);

        const onMouseDown = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
        
            switch (action) {
                case 'rectangle':
                    setCurrentShape(generator.rectangle(x, y, x, y, options));
                    break;
                case 'circle':
                    setCurrentShape(generator.circle(x, y, 0, options));
                    break;
                case 'line':
                    setCurrentShape(generator.line(x, y, x, y, options));
                    break;
                default:
                    break;
            }
        };
        

        const onMouseUp = (e) => {
            if (currentShape) {
                setElements([...elements, currentShape]);
                setCurrentShape(null);
            }
        };

        const onMouseMove = (e) => {
            if (!currentShape) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            switch (action) {
                case 'rectangle':
                    currentShape.x2 = x;
                    currentShape.y2 = y;
                    break;
                case 'circle':
                    const dx = x - currentShape.x1;
                    const dy = y - currentShape.y1;
                    currentShape.radius = Math.sqrt(dx * dx + dy * dy);
                    break;
                case 'line':
                    currentShape.x2 = x;
                    currentShape.y2 = y;
                    break;
                default:
                    break;
            }
        };

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mousemove', onMouseMove);

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('mousemove', onMouseMove);
        };
    }, [action, currentShape, elements]);

    useEffect(() => {
        drawShapes();
    }, [elements]);

    const drawShapes = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        elements.forEach(shape => {
            switch (shape.type) {
                case 'rectangle':
                    generator.rectangle(shape.x1, shape.y1, shape.x2, shape.y2, shape.options);
                    break;
                case 'circle':
                    generator.circle(shape.x, shape.y, shape.radius, shape.options);
                    break;
                case 'line':
                    generator.line(shape.x1, shape.y1, shape.x2, shape.y2, shape.options);
                    break;
                default:
                    break;
            }
        });
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                id='canvas'
                height={window.innerHeight}
                width={window.innerWidth}
                className='relative bg-zinc-800'
            ></canvas>
            <div>
                <button onClick={() => setAction('rectangle')}>Rectangle</button>
                <button onClick={() => setAction('circle')}>Circle</button>
                <button onClick={() => setAction('line')}>Line</button>
            </div>
        </>
    );
}

export default CanvasGPT;

