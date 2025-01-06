import { styled } from "@mui/material/styles"
import Button from "@mui/material/Button"
import { useTheme } from "@mui/system"
const PrimaryButton = styled(Button)(
  ({ height = "6.4rem", width = "23rem", disabled, fontSize = "1.6rem", fontWeight = 600 }) => {
    const theme = useTheme()
    return {
      boxShadow: "none",
      color: disabled
        ? `${theme?.palette?.text?.white} !important`
        : `${theme?.palette?.text?.white}`,
      textTransform: "none",
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: height,
      width: width,
      padding: "0.6rem 1.2rem",
      lineHeight: `${theme?.typography?.button?.lineHeight}`,
      backgroundColor: disabled
        ? `${theme?.palette?.disable?.main}`
        : `${theme?.palette?.primary?.main}`,
      "&:hover": {
        backgroundColor: `${theme?.palette?.primary?.main}`,
        boxShadow: "none"
      },
      "&:active": {
        boxShadow: "none",
        backgroundColor: `${theme?.palette?.primary?.main}`
      },
      borderRadius: "0.8rem"
    }
  }
)

export default PrimaryButton
