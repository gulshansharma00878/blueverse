export const preventNonNumericalInput = (e) => {
  e = e || window.event
  var charCode = typeof e.which == "undefined" ? e.keyCode : e.which
  var charStr = String.fromCharCode(charCode)

  if (!charStr.match(/^[0-9]+$/)) e.preventDefault()
}
