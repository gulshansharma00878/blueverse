import { TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useTheme } from "@mui/system"
const InputField = styled(TextField)(() => {
  const theme = useTheme()

  return {
    "& .MuiFilledInput-root": {
      border: `1px solid ${theme?.palette?.background?.blue1}`,
      borderRadius: "1rem",
      height: "7.2rem",
      overflow: "hidden",
      fontSize: `${theme.typography.p1.fontSize} !important`,
      fontWeight: `${theme.typography.p1.fontWeight} !important`,
      lineHeight: `${theme.typography.p1.lineHeight} !important`,
      [theme.breakpoints.down("sm")]: {
        fontSize: "2rem !important"
      },
      backgroundColor: "white"
      // paddingRight: "0.6rem"
    },
    "& .MuiFilledInput-input": {
      paddingTop: "1rem",
      [theme.breakpoints.down("sm")]: {
        paddingTop: "2rem"
      },
      height: "100%" // This will fill browser-default form-background color with full height in the input field specifically fixing chrome issue
    },
    "& .MuiFilledInput-root.Mui-focused": {
      backgroundColor: "white !important",
      border: `2px solid ${theme?.palette?.background?.blue2} !important`
    },
    "& .MuiFilledInput-root.Mui-error": {
      backgroundColor: "white !important",
      border: `1px solid ${theme?.palette?.error?.main} !important`
    },
    "& .MuiFilledInput-root:hover": {
      backgroundColor: "white !important",
      border: "1px solid black"
    },
    "& .MuiFormLabel-root": {
      fontSize: `${theme.typography.p2.fontSize} !important`,
      fontWeight: `${theme.typography.p2.fontWeight} !important`,
      lineHeight: `${theme.typography.p2.lineHeight} !important`,
      color: `${theme.palette.text.gray} !important`,
      [theme.breakpoints.down("sm")]: {
        fontSize: "1.8rem !important"
      }
    },
    "& .MuiFormHelperText-root": {
      marginLeft: "0rem"
    },
    fontSize: "1.6rem !important",
    fontWeight: "600 !important"
  }
})

export default InputField
