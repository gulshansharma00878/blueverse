import React from "react"
import { Grid, IconButton, Typography } from "@mui/material"
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import SearchBar from "components/utilities-components/Search"
import { useStyles } from "../feedbackStyles"
export const PageHeader = (props) => {
  //eslint-disable-next-line no-unused-vars

  const { setQuery, title, hideFilters, subTitle, goBack, handleDrawer, hideBack } = props
  const styles = useStyles()
  return (
    <>
      <Grid container>
        <Grid item xs={12} sx={[styles?.display, styles?.align, styles?.marginBottom]}>
          {!hideBack && (
            <div>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                className="filtericonBox"
                style={styles?.smallMarginLeft}
                onClick={goBack}>
                <ArrowBackIcon color="primary" fontSize="large" />
              </IconButton>
            </div>
          )}{" "}
          <div style={styles?.titleContainer}>
            <Typography variant="h7" sx={styles?.noMargin}>
              {title}
            </Typography>
            {subTitle && (
              <Typography sx={[styles?.maxChar, styles?.subTitle]}>{subTitle}</Typography>
            )}
          </div>
        </Grid>
      </Grid>
      {hideFilters ? null : (
        <Grid container>
          <Grid item xs={12} sx={[styles?.display, styles?.justifyEnd, styles?.marginBottom]}>
            <SearchBar setQuery={setQuery} />
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className="filtericonBox"
              style={styles?.marginLeft}
              onClick={handleDrawer}>
              <FilterAltOutlinedIcon color="primary" />
            </IconButton>
          </Grid>
        </Grid>
      )}
    </>
  )
}
