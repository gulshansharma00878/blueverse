const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  },
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center"
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center"
  },
  variant: "menu"
}
const options = [
  { id: 1, label: "Oliver Hansen" },
  { id: 2, label: "Van Henry" },
  { id: 3, label: "April Tucker" },
  { id: 4, label: "Omar Alexander" }
]

export { options, MenuProps }
