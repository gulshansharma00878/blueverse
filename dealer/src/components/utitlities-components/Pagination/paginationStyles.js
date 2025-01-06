const useStyles = () => {
  return {
    dropdownBox: {
      display: "flex",
      alignItems: "center",
      gap: "1.6rem"
    },
    menuPaper: {
      "& .MuiPopover-paper": {
        boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.2)",
        borderRadius: "1rem"
      },
      "& .MuiMenuItem-root": {
        minHeight: "0"
      }
    }
  }
}

export default useStyles
