// Info :  This style component is not used directly in this table list component instead being used with dependent components like DealerList and Agent List etc.

import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    table_head_cell1: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.h1.fontWeight,
      backgroundColor: theme?.palette?.secondary?.main
    },
    table_cell: {
      borderBottom: "none",
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.h5.fontWeight
    },
    table_box_container1: {
      borderRadius: "0.8rem"
    }
  }
}
