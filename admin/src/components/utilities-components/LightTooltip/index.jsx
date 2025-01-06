import React from "react"
import { Tooltip, styled } from "@mui/material"

function CustomTooltip({ title = "asd", children }) {
  const StyledTooltip = styled((props) => (
    <Tooltip classes={{ popper: props.className }} {...props} />
  ))`
    & .MuiTooltip-tooltip {
      display: flex;
      background-color: ${({ theme }) => theme.palette.background.default};
      border-radius: 0.8rem;
      box-shadow: 0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12);
      padding: 2.4rem;
    }
  `
  return (
    <StyledTooltip title={title} arrow={true} placement="top">
      {children}
    </StyledTooltip>
  )
}

export default CustomTooltip
