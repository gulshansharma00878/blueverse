import { styled } from "@mui/material/styles"
import OutlinedInput from "@mui/material/OutlinedInput"
import { useTheme } from "@mui/system"

/**
 * @description This input field can be used as :
 * * Input Field to be passed as prop for native 'Field' option of Formik. See example : src\components\Roles\CreateRoleForm.jsx
 * * As standalone field to be rendered as styled-outline input field.
 */
const OutlinedInputField = styled(OutlinedInput)(() => {
  const theme = useTheme()

  return {
    fontSize: `${theme.typography.p1.fontSize} !important`,
    fontWeight: `${theme.typography.p1.fontWeight} !important`,
    lineHeight: `${theme.typography.p1.lineHeight} !important`,
    [theme.breakpoints.down("sm")]: {
      fontSize: "2rem !important"
    },
    "& :focus": {
      backgroundColor: "white !important"
    },
    borderColor: "transparent !important",
    "&.MuiOutlinedInput-root": {
      paddingTop: "0rem !important"
    },
    "& .MuiOutlinedInput-input": {
      paddingTop: "2.5rem",
      [theme.breakpoints.down("sm")]: {
        paddingTop: "3.5rem"
      },
      paddingLeft: "12px" // Don't convert this to rem as this is match the default alignment used in MUI text field ( InputField Comp)
    }
  }
})

export default OutlinedInputField
