import { useTheme } from "@emotion/react"

export const useStyles = () => {
  const theme = useTheme()
  return {
    main: {
      padding: " 0 1rem 1rem 1rem",
      backgroundColor: theme.palette.background.main,
      minHeight: "97vh",
      maxHeight: "97vh",
      overflow: "hidden"
    },
    wrapper: {
      padding: "1rem 2rem",
      minHeight: "78vh",
      maxHeight: "78vh",
      overflowX: "auto",
      overflowY: "auto",
      marginTop: "1rem"
    },
    title: {
      color: theme.palette.text.main,
      fontSize: theme.typography.h6.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      marginTop: "0.5rem"
    },
    subHeading: {
      color: theme.palette.text.main,
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.h5.fontWeight
    },
    data: {
      color: theme.palette.text.main,
      fontSize: theme.typography.p2.fontSize,
      fontWeight: theme.typography.c1.fontWeight,
      marginTop: "0.5rem"
    }
  }
}
