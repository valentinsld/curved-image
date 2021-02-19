import { Renderer, Camera, Transform, Plane, Vec2 } from 'ogl'

import { lerp } from './utils/lerp'

import curvedImage from './curvedImage'

class App {
  constructor() {
    this.container = document.getElementById('canva')
    this.title = document.querySelector('.title')

    this.cursor = {
      target: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      speed: 0.1,
      hover: false,
      strength: {
        x: 0, 
        y: 0,
        diviseur: 5,
        max: 6,
      }
    }

    this.createRenderer()
    this.createCamera()
    this.createScene()
    
    this.onResize()
    
    this.createImage()

    this.createEvents()
    this.update()
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true
    })
    
    this.gl = this.renderer.gl

    this.container.append(this.gl.canvas)
  }

  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.fov = 75
    this.camera.position.z = 5
  }

  createScene() {
    this.scene = new Transform()
  }

  createImage() {
    this.imageElement = this.container.querySelector('img')

    this.image = new curvedImage({
      gl: this.gl,
      scene: this.scene,
      screen: this.screen,
      viewport: this.viewport,
      image: this.imageElement
    })
  }

  update() {
    window.requestAnimationFrame(this.update.bind(this))

    this.cursor.current.x = lerp(this.cursor.current.x, this.cursor.target.x, this.cursor.speed)
    this.cursor.current.y = lerp(this.cursor.current.y, this.cursor.target.y, this.cursor.speed)
    this.cursor.strength.x = Math.min((this.cursor.current.x - this.cursor.target.x) / this.cursor.strength.diviseur, this.cursor.strength.max)
    this.cursor.strength.y = Math.min((this.cursor.current.y - this.cursor.target.y) / this.cursor.strength.diviseur, this.cursor.strength.max)

    this.image.update(this.cursor.current, this.cursor.strength)

    this.renderer.render({
      scene: this.scene,
      camera: this.camera
    })
  }

  onResize() {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth
    }

    this.renderer.setSize(this.screen.width, this.screen.height)

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height
    })

    const fov = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

    this.viewport = {
      height,
      width
    }

    this.image?.onResize({
      screen: this.screen,
      viewport: this.viewport,
    })
  }

  /*
  **   Events
  */
  createEvents() {
    window.addEventListener('resize', this.onResize.bind(this))
    this.title.addEventListener('mouseenter', this.appearImage.bind(this))
    this.title.addEventListener('mouseleave', this.disappearImage.bind(this))

    window.addEventListener("mousemove", this.mooveCursor.bind(this));
  }

  mooveCursor(e) {
    this.cursor.target.x = (e.clientX / this.screen.width) * this.viewport.width;
    this.cursor.target.y = (-e.clientY + this.screen.height) / this.screen.height * this.viewport.height;
  }

  appearImage() {
    this.image.setHover(true)
  }
  disappearImage() {
    this.image.setHover(false)
  }
}

export default new App()