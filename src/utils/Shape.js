export class Shape {

    constructor(ctx,options) {
      this.ctx = ctx;
      this.options = options
      this.elements = []  
    }

    getElements(){
      return this.elements
    }

    setElements(elements){
      this.elements = elements
    }

    style(options){
      if(!this.ctx){
        return
      }
      if(options){
        for (let [key, value] of Object.entries(options)) {
          if(key in this.ctx){
            this.ctx[key] = value
          }
        }
      }
    }

    rectangle(x1,y1,x2,y2,options){
      if(!this.ctx){
        return;
      }
      this.x1 = x1
      this.y1 = y1
      this.x2 = x2
      this.y2 = y2

      this.style(options)

      this.type = "rectangle"
      
      this.ctx.beginPath()
      this.ctx.strokeRect(x1,y1,x2-x1,y2-y1)
      const ele = {
        x1:this.x1,
        y1: this.y1,
        x2:this.x2,
        y2:this.y2,
        type: this.type,
        ctx: this.ctx,
        options: (options ? options : this.options)
      }
      
      return ele
    }

    line(x1,y1,x2,y2,options){
      this.x1 = x1
      this.x2 = x2
      this.y1 = y1
      this.y2 = y2
      this.type = "line"

      if(!this.ctx){
        return
      }
      this.style(options)

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.closePath()
      this.ctx.stroke()
      const ele =  {
        x1:this.x1,
        y1: this.y1,
        x2:this.x2,
        y2:this.y2,
        type: this.type,
        ctx: this.ctx,
        options: (options ? options : this.options)
      }

      return ele
      
    }

    circle(x1,y1,radius,options){
      this.x1 = x1
      this.y1 = y1
      this.radius = radius
      this.type = "circle"
      
      this.style(options)

      this.ctx.beginPath();
      this.ctx.arc(x1,y1,radius,0, Math.PI * 2, true)
      this.ctx.stroke()

      const ele = {
        x1:this.x1,
        y1: this.y1,
        radius:this.radius,
        type: this.type,
        ctx: this.ctx,
        options: (options ? options : this.options)
      }

      return ele

    }

    ellipse(x1,y1,x2,y2,options){
      this.x1 = x1
      this.x2 = x2
      this.y1 = y1
      this.y2 = y2
      this.type = "ellipse"
      this.style(options)

      const ax1 = x2-x1
      const ax2 = y2-y1

      const major = Math.max(ax1,ax2)
      const minor = Math.min(ax1,ax2)

      this.ctx.beginPath()
      this.ctx.ellipse((x1+x2)/2, (y1+y2)/2, Math.abs(major)/2, Math.abs(minor)/2, 0, 0, 2 * Math.PI)
      this.ctx.stroke()
      const ele = {
        x1:this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        type: this.type,
        ctx: this.ctx,
        options: (options ? options : this.options)
      }

      return ele

    }

    polygon(pts,options){
      if(!pts){
        return
      }

      this.type = "polygon"
      this.style(options)
      this.ctx.beginPath();
      this.ctx.moveTo(pts[0][0], pts[0][1]);
      for(let item=1 ; item < pts.length ; item+=1 ){
        this.ctx.lineTo( pts[item][0] , pts[item][1] )
      }
      
      this.ctx.closePath();
      this.ctx.stroke();

      const ele = {
        points: pts,
        type: this.type,
        ctx: this.ctx,
        options: (options ? options : this.options)
      }

 
      return ele

    }

    textBox(x,y,text,width,options){
      this.type = "text"
      this.text = text
      this.x = x
      this.y = y

      this.ctx.font = "48px serif"
      width = width ? width : text.length*100
      this.ctx.fillText(text,x,y,width)
      
      const ele = {
        x: this.x,
        y: this.y,
        text: this.text,
        type : this.type,
        ctx: this.ctx,
        options: (options ? options : this.options)
      }

      return ele
    }

    svg(path,options){
      this.type = "svg"
      let p = new Path2D(path)
      this.ctx.fill(p)

      const ele ={
        path: path,
        type: this.type,
        ctx: this.ctx,
        options: (options ? options : this.options)
      }
      return ele
    }

    draw(elements){
      if(elements.length ==0 ){
        return
      }
      elements.map((el, i) => {
        if(!el){
          return
        }
        const shape = el.type

        switch(shape){
          case "rectangle":
            return this.rectangle(el.x1,el.y1,el.x2,el.y2,el.options)
          case "line":
            return this.line(el.x1,el.y1,el.x2,el.y2,el.options)
          case "circle":
            return this.circle(el.x1,el.y1,el.radius,el.options)
          case "ellipse":
            return this.ellipse(el.x1,el.y1,el.x2,el.y2,el.options)
          case "polygon":
            return this.polygon(el.points,el.options)
          case "svg":
            return this.svg(el.path,el.options)
          case "text":
            return this.textBox(el.x,el.y,el.text,el.width,el.options)

          default:
            return
        }

      })
    }

    render(){
      this.elements.map((el, i) => {
        const shape = el.type

        switch(shape){
          case "rectangle":
            return this.rectangle(el.x1,el.y1,el.x2,el.y2,el.options)
          case "line":
            return this.line(el.x1,el.y1,el.x2,el.y2,el.options)
          case "circle":
            return this.circle(el.x1,el.y1,el.radius,el.options)
          case "ellipse":
            return this.ellipse(el.x1,el.y1,el.x2,el.y2,el.options)
          case "polygon":
            return this.polygon(el.points,el.options)
          default:
            return
        }

      })

    }

}