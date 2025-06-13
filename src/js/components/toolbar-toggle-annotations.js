import Events from '../lib/events'

const $annotationRadios = document.querySelectorAll('input[name="annotations-radio"]')

$annotationRadios.forEach(radioButton => {
  radioButton.addEventListener('change', (event) => {
    const isHidden = event.target.value === 'off'
    PubSub.publish(Events.TOOLBAR_ANNOTATIONS_TOGGLED, isHidden)
  })
})