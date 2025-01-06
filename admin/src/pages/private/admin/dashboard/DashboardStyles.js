import { useTheme } from "@mui/material"

export const useStyles = () => {
  const theme = useTheme()
  return {
    outerBox: {
      display: "flex",
      alignItems: "center"
    },
    mainWrapper: {
      padding: "1.2rem",
      backgroundColor: theme?.palette?.background?.yellow3,
      borderRadius: "0.8rem",
      marginBottom: "2.4rem"
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
    infoBox: {
      backgroundColor: theme?.palette?.secondary?.main,
      padding: "1.6rem 1.2rem",
      width: "85%",
      marginBottom: "2.4rem",
      borderRadius: "0.8rem"
    },
    adminInfoBox: {
      backgroundColor: theme?.palette?.secondary?.main,
      padding: "1.6rem 1.2rem",
      marginBottom: "2.4rem",
      borderRadius: "0.8rem",
      width: "100%"
    },
    oemBox: {
      backgroundColor: theme?.palette?.secondary?.main,
      padding: "1.6rem 1.2rem",
      width: "14%",
      marginBottom: "2.4rem",
      borderRadius: "0.8rem",
      display: "flex"
    },
    chartWrapper: {
      padding: "2.4rem 2rem",
      border: `1px solid ${theme?.palette?.background?.gray1}`,
      mt: "2.4rem",
      height: "50rem"
    },
    chartHeader: {
      display: "flex",
      justifyContent: "flex-start",
      width: "50%",
      alignItems: "center"
    },
    dateBox: {
      display: "flex",
      justifyContent: "flex-end",
      padding: "1rem",
      border: `1px solid ${theme?.palette?.background?.blue1}`,
      height: "7.3rem",
      borderRadius: "0.6rem"
    },
    machineBox: {
      height: "6rem",
      width: "22rem"
    },
    machineFilter: {
      width: "100%"
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
      padding: "0.8rem 0.4rem",
      height: "2.8rem",
      width: "10%",
      borderRadius: "0.4rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "1.2rem",
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
      alignItems: "center",
      flexWrap: "wrap"
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
