/**
 * Updates the CSS to set a custom pencil cursor of a specific color,
 * with horizontal and vertical offsets.
 * @param {string} color - A CSS color string (e.g., 'red', '#ff0000').
 */
function updatePencilCursor(color) {
  const paddingLeft = 4
  const paddingBottom = 7
  const visualSize = 16

  const finalWidth = visualSize + paddingLeft
  const finalHeight = visualSize + paddingBottom

  const hotspotX = 0
  const hotspotY = finalHeight - 1

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${finalWidth}"
         height="${finalHeight}"
         viewBox="0 0 ${finalWidth} ${visualSize}">
      <!-- This group shifts the drawing to the right. Vertical padding is handled by the canvas size and hotspot location. -->
      <g transform="translate(${paddingLeft}, 0)">
        <path fill="${color}"
              d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
      </g>
    </svg>
  `

  const encodedSvg = encodeURIComponent(svg)
  const cursorUrl = `url('data:image/svg+xml;utf8,${encodedSvg}')`
  const fullCursorValue = `${cursorUrl} ${hotspotX} ${hotspotY}`

  document.documentElement.style.setProperty('--pencil-cursor-url', fullCursorValue)
}

export default updatePencilCursor