import { Transform, Plane, Program, Mesh, Texture } from 'ogl'

import easingsFunctions from './utils/easings'

import vertex from '../shaders/vertex.glsl'
import fragment from '../shaders/fragment.glsl'

export default class curvedImage{
  constructor({gl, scene, screen, viewport, image}) {
    this.gl = gl
    this.scene = scene
    this.screen = screen
    this.viewport = viewport

    this.image = image
    this.hover = false
    this.animation = 0
    this.startAnimation = undefined

    this.createMesh()

    this.onResize()
  }

  createMesh() {
    // Geometry
    this.planeGeometry = new Plane(this.gl, {
      widthSegments: 20,
      heightSegments: 20
    })

    // Material
    const image = new Image()
    const texture = new Texture(this.gl)

    image.src = this.image.src
    image.onload = _ => {
      program.uniforms.uImageSizes.value = [image.naturalWidth, image.naturalHeight]
      texture.image = image
      
      this.bounds = this.image.getBoundingClientRect()
      this.sizeScale()
    }

    const program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        tMap: { value: texture },
        uPos: { value: [0, 0] },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uViewportSizes: { value: [this.viewport.width, this.viewport.height] },
        uStrength: { value: [0, 0] },
        uAnimation: { value: this.animation },
      },
      transparent: true
    })

    this.plane = new Mesh(this.gl, {
      geometry: this.planeGeometry,
      program
    })

    this.plane.setParent(this.scene)
  }

  sizeScale () {
    if (!this.bounds) return;
    
    this.plane.scale.x = this.viewport.width * this.bounds.width / this.screen.width
    this.plane.scale.y = this.viewport.height * this.bounds.height / this.screen.height

    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y]
  }

  onResize (sizes) {
    this.extra = 0

    this.sizeScale()

    if (sizes) {
      const { screen, viewport } = sizes

      if (screen) this.screen = screen
      if (viewport) {
        this.viewport = viewport

        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height]
      }
    }
  }

  update(cursor, strength) {
    const x = cursor.x - this.viewport.width / 2
    const y = cursor.y - this.viewport.height / 2
    this.plane.position.set(x, y, 0)

    this.plane.program.uniforms.uPos.value = [0, 0]
    this.plane.program.uniforms.uStrength.value = [strength.x, strength.y]

    if (this.hover && this.animation < 1) {
      this.animation = (new Date() - this.startAnimation) / 1000 * 2
      this.animation = Math.min(this.animation, 1)

      this.plane.program.uniforms.uAnimation.value = this.animation
    } else if (!this.hover && this.animation > 0) {
      this.animation = 1 - ((new Date() - this.startAnimation) / 1000 * 2)
      this.animation = Math.max(this.animation, 0)

      this.plane.program.uniforms.uAnimation.value = easingsFunctions.easeInOutCubic(this.animation)
    }
  }

  setHover(boolean) {
    this.hover = boolean
    this.startAnimation = new Date()
  }
}