import Events from '../lib/events'

const $zoomOut = document.querySelector('.c-toolbar__zoom-out')
const $zoomIn = document.querySelector('.c-toolbar__zoom-in')

const ZOOM_MIN = 1
const ZOOM_MAX = 4
let currentZoom = 1

const ZOOM_LEVEL_SCALES = {
  1: 1.0,
  2: 1.5,
  3: 2.5,
  4: 4.0,
}

$zoomOut.addEventListener('click', onZoomOutClick)
$zoomIn.addEventListener('click', onZoomInClick)

function onZoomInClick(e) {
  currentZoom++
  if (currentZoom > ZOOM_MAX) {
    currentZoom = ZOOM_MAX
  }
  checkZoomBtnsAreEnabled()
  PubSub.publish(Events.TOOLBAR_ZOOM_CHANGED, ZOOM_LEVEL_SCALES[currentZoom])
}

function onZoomOutClick(e) {
  currentZoom--
  if (currentZoom < ZOOM_MIN) {
    currentZoom = ZOOM_MIN
  }
  checkZoomBtnsAreEnabled()
  PubSub.publish(Events.TOOLBAR_ZOOM_CHANGED, ZOOM_LEVEL_SCALES[currentZoom])
}

function checkZoomBtnsAreEnabled() {
  $zoomIn.disabled = currentZoom === ZOOM_MAX
  $zoomOut.disabled = currentZoom === ZOOM_MIN
}
