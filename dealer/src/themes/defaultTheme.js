// default app theme and colors
export const defaultTheme = {
  palette: {
    primary: {
      main: "#1F59AF"
    },
    secondary: {
      main: "#F3F8FE"
    },
    error: {
      main: "#FF0040"
    },
    background: {
      default: "#FFFFFF",
      main: "#E5E5E5",
      blue1: "#C9D8EF",
      blue2: "#4775FF",
      gray1: "#E6E9ED",
      gray2: "#79A0DA",
      gray3: "#E6E6E6",
      gray4: "#CCD2DA",
      blue3: "#668CFF",
      blue4: "#3C68ED",
      blue7: "#1F59AF",
      blue5: "#F8FBFF",
      blue6: "#E8FBF6",
      blue8: "#A1BCE3",
      blue9: "#99B3FF",
      green: "#94DD60",
      green2: "#E7FAF0",
      green3: "#C1ECD4",
      green4: "#C9E9B2",
      green5: "#5AAF9A",
      pink1: "#FFF7EA",
      pink2: "#FFE5E7",
      pink3: "#F5F6F8",
      pink4: "#E8DEF4",
      pink5: "#F5E3C2",
      gold: "#EFCB8A",
      silver: "#8692A4",
      platinum: "#B29FCB",
      yellow: "#FFB020",
      yellow2: "#FDC55F"
    },
    text: {
      main: "#181A1E",
      white: "#FFF",
      gray: "#8692A4",
      gray2: "#939393",
      gray3: "#A4AEBC",
      red1: "#FF4049",
      red2: "#FF8086",
      red3: "#FF000D",
      red4: "#FF1925",
      green: "#5CA91D",
      gold2: "#FFB020"
    },
    disable: {
      main: "#8692A4"
    }
  },
  typography: {
    fontFamily: "'Metropolis', sans-serif",
    h1: {
      fontSize: "9.6rem",
      lineHeight: "11.6rem",
      fontWeight: 700
    },
    h2: {
      fontSize: "6.4rem",
      lineHeight: "9.2rem",
      fontWeight: 700
    },
    h3: {
      fontSize: "4.8rem",
      lineHeight: "7.2rem",
      fontWeight: 700
    },
    h4: {
      fontSize: "4rem",
      lineHeight: "6rem",
      fontWeight: 700
    },
    h5: {
      fontSize: "3.2rem",
      lineHeight: "4.8rem",
      fontWeight: 600
    },
    h6: {
      fontSize: "2.4rem",
      lineHeight: "3.2rem",
      fontWeight: 600
    },
    h7: {
      fontSize: "2rem",
      lineHeight: "2.4rem",
      fontWeight: 600
    },
    s1: {
      fontSize: "1.8rem",
      lineHeight: "2.4rem",
      fontWeight: 600
    },
    p1: {
      fontSize: "1.6rem",
      lineHeight: "2rem",
      fontWeight: 600
    },
    p2: {
      fontSize: "1.4rem",
      lineHeight: "2rem",
      fontWeight: 600
    },
    p3: {
      fontSize: "1.2rem",
      lineHeight: "1.6rem",
      fontWeight: 600
    },
    p4: {
      fontSize: "1.4rem",
      lineHeight: "2rem",
      fontWeight: 500
    },
    p5: {
      fontSize: "1.2rem",
      lineHeight: "1.6rem",
      fontWeight: 500
    },
    button: {
      fontSize: "1.4rem",
      lineHeight: 18 / 13,
      letterSpacing: 0.2,
      fontWeight: 700,
      textTransform: "unset"
    },
    c1: {
      fontSize: "1.3rem",
      lineHeight: 20 / 13,
      fontWeight: 500
    },
    c2: {
      fontSize: "1.2rem",
      lineHeight: 17 / 12,
      fontWeight: 600
    },
    label: {
      fontSize: "1.1rem",
      lineHeight: 15 / 11,
      fontWeight: 600
    }
  },
  shadows: ["1", "2", "3", "4", "none"],
  overrides: {},
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1280,
      xl: 1920
    }
  }
}

/**
 * ****** List Of z-indices Used in the app ******
 * Loader :  5000 ( Should be highest )
 * Popup Modal : 2500 ( Should be lower than loader but higher than common footer)
 * Date Select : 2300 ( Should be lower than popup modal but higher than filter drawer)
 * Filter Drawer : 2200 ( Should be lower than date select but higher then common footer)
 * Common Footer : 2000 ( Should be low from popup)
 * Table First Freezed Column : 10 ( Should be low from Common Footer )
 *  */
