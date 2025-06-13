import Events from '../lib/events'

const $eraserToggle = document.querySelector('.c-toolbar__eraser')

$eraserToggle.addEventListener('click', onEraserClick)

function onEraserClick() {
  $eraserToggle.classList.add('active')
  PubSub.publish(Events.TOOLBAR_ERASER_CLICKED)
}

PubSub.subscribe(Events.TOOLBAR_FONT_CLICKED, removeActive)
PubSub.subscribe(Events.TOOLBAR_STROKE_CLICKED, removeActive)
function removeActive() {
  $eraserToggle.classList.remove('active')
}