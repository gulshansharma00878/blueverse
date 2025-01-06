import { useTheme } from "@mui/material"
export const useStyles = () => {
  const theme = useTheme()

  return {
    tableRow: {
      color: theme.palette?.text?.main,
      fontSize: theme.typography?.p3?.fontSize,
      fontWeight: theme.typography?.p3?.fontWeight,
      border: 0
    }
  }
}
