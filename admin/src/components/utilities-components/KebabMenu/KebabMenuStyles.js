export const useStyles = () => {
  return {
    popover: {
      "& .MuiPopover-paper": {
        boxShadow: "0px 4px 12px rgba(31, 61, 226, 0.12)"
      }
    },
    outerBox: {
      height: "fit-content",
      width: "16.2rem",
      borderRadius: "0.8rem"
    },
    popBox: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      gap: "1rem",
      paddingX: "1.2rem",
      marginY: "1.2rem"
    }
  }
}
