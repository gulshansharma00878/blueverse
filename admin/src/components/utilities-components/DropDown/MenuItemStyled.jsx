import { styled } from "@mui/material/styles"
import { useTheme } from "@mui/system"
import MenuItem from "@mui/material/MenuItem"

const MenuItemStyled = styled(MenuItem)(() => {
  const theme = useTheme()
  return {
    fontSize: `${theme.typography.p1.fontSize} !important`,
    fontWeight: theme.typography.p1.fontWeight,
    lineHeight: theme.typography.p1.lineHeight,
    color: theme.palette.text.main,
    [theme.breakpoints.down("sm")]: {
      fontSize: "2rem !important"
    }
  }
})

export default MenuItemStyled
