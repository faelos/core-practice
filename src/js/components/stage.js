import Konva from 'konva'
import debounce from 'lodash.debounce'
import updatePencilCursor from '../lib/pencil-cursor'
import Events from '../lib/events'

PubSub.subscribe(Events.IMAGE_UPLOAD_NEW_IMAGE, onNewImage)
PubSub.subscribe(Events.TOOLBAR_ANNOTATIONS_TOGGLED, onAnnotationsToggled)
PubSub.subscribe(Events.TOOLBAR_FONT_SIZE_CHANGED, onFontSizeChange)
PubSub.subscribe(Events.TOOLBAR_ZOOM_CHANGED, onZoomChange)
PubSub.subscribe(Events.TOOLBAR_STROKE_WIDTH_SELECTED, onStrokeWidthSelected)
PubSub.subscribe(Events.TOOLBAR_STROKE_COLOR_CHANGED, onStrokeColorChange)
PubSub.subscribe(Events.TOOLBAR_FONT_COLOR_CHANGED, onFontColorChange)
PubSub.subscribe(Events.TOOLBAR_STROKE_CLICKED, onStrokeClicked)
PubSub.subscribe(Events.TOOLBAR_FONT_CLICKED, onFontClicked)
PubSub.subscribe(Events.TOOLBAR_ERASER_CLICKED, onEraserClicked)

Konva._fixTextRendering = true
const $stage = document.querySelector('.c-stage')

const Modes = {
  DRAW: 'draw',
  ERASE: 'erase',
  TEXT: 'text'
}

const StrokeWidths = {
  THIN: 2,
  MEDIUM: 5,
  THICK: 10
}

let currentMode = Modes.DRAW
let currentStrokeWidth = StrokeWidths.MEDIUM
let currentStrokeColor = '#FF0000'
let currentFontColor = '#000000'
let currentFontSize = 20
let selectedNode = null
let currentImageNode = null

const MIN_SCALE = 1.0 // initial, default
const MAX_SCALE = 10.0 // maximum zoom level
let isZoomed = false

let stage = null
let textLayer = new Konva.Layer()
let drawLayer = new Konva.Layer()
let imageLayer = new Konva.Layer()

let transformer = new Konva.Transformer({
  enabledAnchors: ['middle-left', 'middle-right'],
  boundBoxFunc: function (oldBox, newBox) {
    const minTextNodeWidth = 50
    newBox.width = Math.max(minTextNodeWidth, newBox.width)
    return newBox
  },
})

textLayer.add(transformer)

function onEraserClicked() {
  currentMode = Modes.ERASE
  updateStageClass()
}

function onStrokeClicked() {
  currentMode = Modes.DRAW
  updateStageClass()
}

function onFontClicked() {
  currentMode = Modes.TEXT
  updateStageClass()
  createText()
}

function updateStageClass() {
  $stage.classList.remove('is-erasing', 'is-drawing', 'is-texting', 'is-pannable')

  if (isZoomed) {
    $stage.classList.add('is-pannable')
    return
  }

  switch (currentMode) {
    case Modes.DRAW:
      $stage.classList.add('is-drawing')
      break
    case Modes.ERASE:
      $stage.classList.add('is-erasing')
      break
    case Modes.TEXT:
      $stage.classList.add('is-texting')
      break
  }
}

function onStrokeColorChange(msg, color) {
  currentStrokeColor = color
  updatePencilCursor(color)
}

function onFontColorChange(msg, color) {
  currentFontColor = color

  if (selectedNode instanceof Konva.Text) {
    selectedNode.fill(color)
  }
}

function onFontSizeChange(msg, newFontSize) {
  currentFontSize = newFontSize

  if (selectedNode instanceof Konva.Text) {
    selectedNode.fontSize(newFontSize)
  }
}

function onStrokeWidthSelected(msg, width) {
  currentStrokeWidth = StrokeWidths[width]
}

function onAnnotationsToggled(msg, isHidden) {
  drawLayer.visible(!isHidden)
  textLayer.visible(!isHidden)
}

function onNewImage(msg, imgFile) {

  if (!stage) createStage()

  // cleanup
  imageLayer.destroyChildren()
  drawLayer.destroyChildren()
  textLayer.find('Text').forEach(text => text.destroy())
  transformer.nodes([])

  const imageURL = URL.createObjectURL(imgFile)

  Konva.Image.fromURL(imageURL, function(konaImage) {
    currentImageNode = konaImage

    fitAndCenterImage()

    imageLayer.add(konaImage)

    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    stage.draggable(false)
    updateStageClass() // Refresh cursor state
  
    URL.revokeObjectURL(imageURL)
  })
}

const debouncedResize = debounce(onResize, 150)

function onResize() {
  if (!stage) return

  // Update stage size to match its container
  stage.width($stage.clientWidth)
  stage.height($stage.clientHeight)

  // Re-fit and center the image without resetting zoom
  fitAndCenterImage()
}

function fitAndCenterImage() {
  if (!currentImageNode || !stage) {
    return
  }

  const img = currentImageNode.image()
  const stageWidth = stage.width()
  const stageHeight = stage.height()
  
  let scale = Math.min(stageWidth / img.width, stageHeight / img.height)
  // don't scale up small images
  scale = Math.min(1.0, scale) 

  const imageWidth = img.width * scale
  const imageHeight = img.height * scale

  // Center the image
  const imageX = (stageWidth - imageWidth) / 2
  const imageY = (stageHeight - imageHeight) / 2
  
  currentImageNode.setAttrs({
    x: imageX,
    y: imageY,
    width: imageWidth,
    height: imageHeight
  })
}

function createStage() {
  $stage.classList.remove('d-none')

  stage = new Konva.Stage({
    container: '.c-stage__canvas',
    width: $stage.clientWidth,
    height: $stage.clientHeight,
  })

  stage.add(imageLayer)
  stage.add(drawLayer)
  stage.add(textLayer)

  stage.on('mousedown touchstart', onStageMouseDown)
  stage.on('mouseup touchend', onStageMouseUp)
  stage.on('mousemove touchmove', onStageMouseMove)
  stage.on('click', onStageClick)
  stage.on('wheel', onWheelZoom)
  window.addEventListener('resize', debouncedResize) 

  updatePencilCursor(currentStrokeColor)
}

//
// drawing / erasing
//
let isPainting = false
let lastLine = null

function onStageMouseDown(e) {
  
  // ignore if text mode
  if (currentMode === Modes.TEXT) return

  if (stage.draggable()) return

  isPainting = true
  const pos = stage.getPointerPosition()
  lastLine = new Konva.Line({
    stroke: currentStrokeColor,
    strokeWidth: currentMode === Modes.DRAW ? currentStrokeWidth : 20, // eraser always thick
    globalCompositeOperation: currentMode === Modes.DRAW ? 'source-over' : 'destination-out',
    lineCap: 'round',
    lineJoin: 'round',
    points: [pos.x, pos.y, pos.x, pos.y],
    strokeScaleEnabled: false, // keep stroke width constant on zoom
  })
  drawLayer.add(lastLine)
}

function onStageMouseUp() {
  isPainting = false
}

function onStageMouseMove(e) {
  if (!isPainting) {
    return
  }

  // prevent scrolling on touch devices
  e.evt.preventDefault()

  const pos = stage.getPointerPosition()
  const newPoints = lastLine.points().concat([pos.x, pos.y])
  lastLine.points(newPoints)
}

//
// text
//

function onStageClick(e) {
  // If the click target is the Stage or the background Image, deselect everything.
  if (e.target === stage || e.target === currentImageNode) {
    detachTransformer()
    return
  }

  // If we click on an object that is NOT a text node (like a line), also deselect.
  if (!(e.target instanceof Konva.Text)) {
    detachTransformer()
  }
}

function createText() {
  const textNode = new Konva.Text({
    text: 'Double click to edit',
    x: stage.width() / 2,
    y: stage.height() / 2,
    fill: currentFontColor,
    fontSize: currentFontSize,
    draggable: true,
    padding: 10,
    align: 'center',
  })

  // center
  const textWidth = textNode.width()
  const textHeight = textNode.height()
  textNode.offsetX(textWidth / 2)
  textNode.offsetY(textHeight / 2)
    
  textLayer.add(textNode)
    
  textNode.on('transform', function () {
    textNode.setAttrs({
      width: textNode.width() * textNode.scaleX(),
      scaleX: 1,
      scaleY: 1,
    })
  })

  textNode.on('click', (e) => {
    attachTransformer(textNode)
  })

  attachTransformer(textNode)
    
  textNode.on('dblclick dbltap', () => {
    textNode.hide()
    transformer.hide()
    
    const textPosition = textNode.absolutePosition()
    const stageBox = stage.container().getBoundingClientRect()

    const scale = stage.scaleX()
    const areaPosition = {
      x: stageBox.left + textPosition.x - textNode.offsetX() * scale,
      y: stageBox.top + textPosition.y - textNode.offsetY() * scale,
    }
 
    const textarea = document.createElement('textarea')
    $stage.appendChild(textarea)
    
    // Apply styles from CSS class and override with dynamic values
    textarea.className = 'c-stage__editable-textarea'
    textarea.value = textNode.text()
    textarea.style.top = `${areaPosition.y}px`
    textarea.style.left = `${areaPosition.x}px`

    textarea.style.width = `${textNode.width() * scale}px`
    textarea.style.height = `${textNode.height() * scale}px`
    textarea.style.fontSize = `${textNode.fontSize() * scale}px`
    textarea.style.padding = `${textNode.padding() * scale}px`

    textarea.style.lineHeight = textNode.lineHeight()
    textarea.style.fontFamily = textNode.fontFamily()
    textarea.style.textAlign = textNode.align()
    textarea.style.color = textNode.fill()
    textarea.style.transform = `rotateZ(${textNode.rotation() || 0}deg) translateY(-${2}px)`
    
    const rotation = textNode.rotation() || 0
    textarea.style.transform = `rotateZ(${rotation}deg)`
    
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
    
    textarea.focus()
    textarea.select()
    
    function removeTextarea() {
      textarea.parentNode.removeChild(textarea)
      window.removeEventListener('click', handleOutsideClick)
      window.removeEventListener('touchstart', handleOutsideClick)
      textNode.show()
      transformer.show()
      transformer.forceUpdate()
    }
    
    function setTextareaWidth(newWidth = 0) {
      if (!newWidth) {
        newWidth = textNode.placeholder.length * textNode.fontSize()
      }
      textarea.style.width = newWidth + 'px'
    }
    
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        textNode.text(textarea.value)
        removeTextarea()
      }
      if (e.key === 'Escape') {
        removeTextarea()
      }
    })
    
    textarea.addEventListener('keydown', function () {
      const scale = textNode.getAbsoluteScale().x
      setTextareaWidth(textNode.width() * scale)
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + textNode.fontSize() + 'px'
    })
    
    function handleOutsideClick(e) {
      if (e.target !== textarea) {
        textNode.text(textarea.value)
        removeTextarea()
      }
    }

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick)
    })

  })
}

// A function to attach the transformer to a node
function attachTransformer(node) {
  selectedNode = node
  transformer.nodes([node])
  textLayer.batchDraw() // redraw layer to show transformer
}

// A function to detach the transformer
function detachTransformer() {
  if (selectedNode) {
    transformer.nodes([])
    selectedNode = null
    textLayer.batchDraw()
  }
}


// 
// zoom logic
//
function onWheelZoom(e) {
  e.evt.preventDefault()

  const oldScale = stage.scaleX()
  const pointer = stage.getPointerPosition()
  const SCALE_BY = 1.1 // amount to zoom on each wheel step

  // Determine new scale
  const direction = e.evt.deltaY > 0 ? -1 : 1 // -1 for wheel down (zoom out), 1 for wheel up (zoom in)
  const newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY
  
  // Clamp scale to our min/max bounds
  const clampedScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE))

  if (clampedScale === oldScale) return

  zoomStage(oldScale, clampedScale, pointer)
}

function zoomStage(oldScale, newScale, point) {
  let newPos

  if (newScale === MIN_SCALE) {
    // on complete zoom out reset position
    newPos = { x: 0, y: 0 }
  } else {
    const mousePointTo = {
      x: (point.x - stage.x()) / oldScale,
      y: (point.y - stage.y()) / oldScale,
    }

    newPos = {
      x: point.x - mousePointTo.x * newScale,
      y: point.y - mousePointTo.y * newScale,
    }
  }

  stage.scale({ x: newScale, y: newScale })
  stage.position(newPos)
  
  // Enable panning only when zoomed in
  isZoomed = newScale > MIN_SCALE
  stage.draggable(isZoomed)
  
  updateStageClass()
}

function onZoomChange(msg, newScale) {
  if (!stage) return

  const oldScale = stage.scaleX()

  if (newScale === oldScale) return

  // For button clicks, we'll zoom towards the center of the visible stage area.
  const centerPoint = {
    x: stage.width() / 2,
    y: stage.height() / 2,
  }

  zoomStage(oldScale, newScale, centerPoint)
}