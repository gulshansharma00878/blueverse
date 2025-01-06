import { styled } from "@mui/material/styles"
import Button from "@mui/material/Button"
import { useTheme } from "@mui/system"
const SecondaryButton = styled(Button)(
  ({ height = "6.4rem", width = "23rem", fontSize = "1.6rem", fontWeight = 600 }) => {
    const theme = useTheme()
    return {
      boxShadow: "none",
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: height,
      width: width,
      color: `${theme?.palette?.primary?.main}`,
      textTransform: "none",
      // fontSize: `${theme?.typography?.button?.fontSize}`,
      padding: "0.6rem 1.2rem",
      lineHeight: `${theme?.typography?.button?.lineHeight}`,
      backgroundColor: `${theme?.palette?.text?.white}`,
      border: `1px solid ${theme?.palette?.primary?.main}`,
      "&:hover": {
        backgroundColor: `${theme?.palette?.text?.white}`,
        boxShadow: "none"
      },
      "&:active": {
        boxShadow: "none",
        backgroundColor: `${theme?.palette?.text?.white}`
      }
    }
  }
)

export default SecondaryButton
