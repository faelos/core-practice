import Events from '../lib/events'

const $fontRange = document.querySelector('.c-toolbar__font-range')
const $fontSize = document.querySelector('.c-toolbar__font-size')
const $fontColor = document.querySelector('.c-toolbar__font-color')
const $fontToggle = document.querySelector('.c-toolbar__font')

const FONT_SIZE_MIN = 14
const FONT_SIZE_MAX = 72

$fontToggle.addEventListener('click', onFontClick)

function onFontClick() {
  $fontToggle.classList.add('active')
  PubSub.publish(Events.TOOLBAR_FONT_CLICKED)
}

$fontColor.addEventListener('input', onFontColorChange)

function onFontColorChange(e) {
  PubSub.publish(Events.TOOLBAR_FONT_COLOR_CHANGED, e.target.value)
}

$fontRange.addEventListener('input', onFontRangeChange)

function onFontRangeChange(e) {
  PubSub.publish(Events.TOOLBAR_FONT_SIZE_CHANGED, parseInt(e.target.value, 10))
  $fontSize.value = e.target.value
}

$fontSize.addEventListener('input', onFontSizeInput)
$fontSize.addEventListener('blur', onFontSizeBlur)
$fontSize.addEventListener('keydown', onFontSizeKeyDown)

function onFontSizeInput(e) {

  const currentValue = parseInt(e.target.value, 10)

  if (isNaN(currentValue)) {
    return
  }

  // check value is valid
  if (currentValue >= FONT_SIZE_MIN && currentValue <= FONT_SIZE_MAX) {
    PubSub.publish(Events.TOOLBAR_FONT_SIZE_CHANGED, currentValue)
    $fontRange.value = currentValue
  }
}

// clamp invalid values and revalidate
function onFontSizeBlur(e) {

  const currentValue = parseInt(e.target.value, 10)

  if (isNaN(currentValue)) {
    return
  }

  if (currentValue > FONT_SIZE_MAX) {
    $fontSize.value = FONT_SIZE_MAX
  }

  if (currentValue < FONT_SIZE_MIN) {
    $fontSize.value = FONT_SIZE_MIN
  }

  $fontSize.dispatchEvent(new Event('input'))
}

// on 'Enter' trigger blur
function onFontSizeKeyDown(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    this.blur()
  }
}

PubSub.subscribe(Events.TOOLBAR_STROKE_CLICKED, removeActive)
PubSub.subscribe(Events.TOOLBAR_ERASER_CLICKED, removeActive)
function removeActive() {
  $fontToggle.classList.remove('active')
}