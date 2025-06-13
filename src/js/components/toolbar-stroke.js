import Events from '../lib/events'

const $strokeRadios = document.querySelectorAll('input[name="stroke-radio"]')
const $strokeColor = document.querySelector('.c-toolbar__stroke-color')
const $strokeToggle = document.querySelector('.c-toolbar__stroke')

$strokeRadios.forEach(radioButton => {
  radioButton.addEventListener('change', (event) => {
    PubSub.publish(Events.TOOLBAR_STROKE_WIDTH_SELECTED, event.target.value.toUpperCase())
    onStrokeClick()
  })
})

$strokeColor.addEventListener('input', onStrokeColorChange)
$strokeToggle.addEventListener('click', onStrokeClick)

function onStrokeColorChange(e) {
  PubSub.publish(Events.TOOLBAR_STROKE_COLOR_CHANGED, e.target.value)
  onStrokeClick()
}

function onStrokeClick() {
  $strokeToggle.classList.add('active')
  PubSub.publish(Events.TOOLBAR_STROKE_CLICKED)
}

PubSub.subscribe(Events.TOOLBAR_FONT_CLICKED, removeActive)
PubSub.subscribe(Events.TOOLBAR_ERASER_CLICKED, removeActive)
function removeActive() {
  $strokeToggle.classList.remove('active')
}