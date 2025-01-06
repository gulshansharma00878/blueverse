import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    outerBox: {
      display: "flex",
      alignItems: "center"
    },
    mainWrapper: {
      p: "1.2rem",
      backgroundColor: theme?.palette?.background?.pink2,
      borderRadius: "0.8rem"
    },
    memoImage: {
      height: "3.5rem",
      width: "3.5rem",
      marginRight: "1.2rem"
    },
    viewBtn: {
      border: `1px solid ${theme?.palette?.text?.red1}`,
      width: "12.8rem",
      height: "4.8rem"
    },
    viewText: {
      fontSize: theme?.typography?.p3?.fontSize,
      fontWeight: theme?.typography?.h4?.fontWeight,
      height: "4.8rem",
      color: theme?.palette?.text?.red1,
      paddingTop: "1.5rem"
    },
    infoBox: {
      backgroundColor: theme?.palette?.secondary?.main,
      padding: "1.6rem 1.2rem",
      width: "100%",
      marginTop: "2.4rem",
      borderRadius: "0.8rem",
      marginBottom: "2.4rem"
    },
    chartWrapper: {
      padding: "2.4rem 2rem",
      border: `1px solid ${theme?.palette?.background?.gray1}`,
      mt: "2.4rem",
      height: "60rem"
    },
    chartHeader: {
      display: "flex",
      justifyContent: "flex-start",
      width: "50%",
      alignItems: "center"
    },
    machineBox: {
      height: "6rem"
    },
    dateBox: {
      display: "flex",
      justifyContent: "flex-end",
      padding: "0.8rem",
      border: `1px solid ${theme?.palette?.background?.blue1}`,
      height: "5.9rem",
      borderRadius: "0.3rem"
    },
    radialLegend1: {
      border: `1px solid ${theme?.palette?.background?.blue2}`,
      borderRadius: "0.8rem",
      padding: "0.8rem",
      width: "16.7rem"
    },
    radialLegend2: {
      border: `1px solid ${theme?.palette?.background?.green}`,
      borderRadius: "0.8rem",
      padding: "0.8rem",
      width: "16.7rem",
      marginTop: "1.6rem"
    },
    machineName: {
      padding: "1rem 2rem",
      height: "2.8rem",
      width: "fit-content",
      borderRadius: "0.4rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "1.2rem",
      cursor: "pointer"
    },
    infoIcon: {
      color: theme.palette.primary.main,
      marginLeft: "1rem",
      cursor: "pointer"
    },
    selectedMachineActive: {
      backgroundColor: theme?.palette?.background?.blue4
    },
    selectedMachineInactive: {
      backgroundColor: theme?.palette?.background?.blue9
    },
    selectedPH: {
      color: theme?.palette?.background?.default,
      backgroundColor: theme?.palette?.background?.blue3
    },
    selectedTDS: {
      border: `1px solid ${theme?.palette?.background?.gray1}`,
      color: theme?.palette?.text?.red1
    },
    waterQualityBtn: {
      minWidth: "8.5rem",
      height: "3.7rem",
      borderRadius: "0.8rem",
      padding: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer"
    },
    selectedBtn: {
      color: theme?.palette?.background?.default,
      backgroundColor: theme?.palette?.background?.blue3,
      border: `1px solid ${theme?.palette?.background?.blue3}`
    },
    unSelectedBtn: {
      color: theme?.palette?.text?.main,
      border: `1px solid ${theme?.palette?.background?.gray1}`,
      backgroundColor: theme?.palette?.background?.default
    },
    cardContainer: {
      width: "100%",
      padding: "1.6rem 2rem",
      display: "flex",
      alignItems: "center",
      borderRadius: "0.5rem",
      border: `2px solid ${theme?.palette?.background?.blue9}`
    },
    walletText: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.palette.text.main,
      marginLeft: "0.5rem"
    },
    walletAmount: {
      fontSize: theme.typography.s1.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.palette.text.main,
      marginLeft: "0.5rem"
    },
    machineCardText: {
      fontSize: theme.typography.p1.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      color: theme.palette.text.main
    },
    machineStatus: {
      marginLeft: "2.7rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
    machineChart: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "2rem"
    },
    runTimeChart: {
      display: "flex",
      justifyContent: "space-between"
    },
    waterQualityBox: {
      display: "flex",
      gap: 2,
      flexWrap: "wrap",
      marginTop: "1.9rem"
    }
  }
}
