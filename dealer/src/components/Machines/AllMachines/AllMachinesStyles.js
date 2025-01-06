import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    machineName: {
      borderBottom: `1px solid ${theme?.palette?.text?.main}`,
      paddingBottom: "0.2rem"
    }
  }
}
