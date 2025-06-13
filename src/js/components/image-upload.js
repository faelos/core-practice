import formatBytes from '../lib/format-bytes'
import Events from '../lib/events'

const $dropZone = document.querySelector('.c-image-upload__dropzone')
const $file = document.querySelector('.c-image-upload__file')
const $errorMsg = document.querySelector('.c-image-upload__error')

const dropzoneMsgDefault = $dropZone.textContent
const validFileTypes = ['image/jpeg', 'image/png', 'image/web', 'image/gif']

function validateFile(file) {
  if (!validFileTypes.includes(file.type)) {
    throw new Error('Invalid file type. Accepted types: JPEG, PNG, WEBP or GIF.')
  }
}

function showError(message) {
  $errorMsg.textContent = message
  $errorMsg.classList.remove('d-none')
}

function hideError() {
  $errorMsg.classList.add('d-none')
}

$dropZone.addEventListener('click', () => $file.click())

$dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  $dropZone.classList.add('is-dragging')
})

$dropZone.addEventListener('dragleave', () => {
  $dropZone.classList.remove('is-dragging')
})

$dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  $dropZone.classList.remove('is-dragging')
  hideError()

  try {
    const file = e.dataTransfer.files[0]
    validateFile(file)
    $file.files = e.dataTransfer.files
    onFileReady()
  } catch (error) {
    showError(error.message)
  }
})

$file.addEventListener('change', () => {
  hideError()
  try {
    if ($file.files.length > 0) {
      validateFile($file.files[0])
      onFileReady()
    }
  } catch (error) {
    showError(error.message)
    $file.value = ''
  }
})

function onFileReady() {
  const file = $file.files?.[0]
  const text = file ? file.name : dropzoneMsgDefault
  $dropZone.textContent = `${text} (${formatBytes(file.size)})`
  PubSub.publish(Events.IMAGE_UPLOAD_NEW_IMAGE, file)
}