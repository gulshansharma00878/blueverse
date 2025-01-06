/*eslint-disable no-unused-vars */
/*eslint-disable no-console */
import React from "react"
import { Grid, Popover, Typography } from "@mui/material"
import { useStyles } from "./DownloadDocument.styles"

function DownloadDocument({ document = [] }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const styles = useStyles()
  const handleClick = (event) => {
    if (document?.length != 0) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  function ImageLink(imageUrl) {
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob)
        //REmoved because downloading extra file
        // window.open(imageUrl, "_blank")
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const open = Boolean(anchorEl)
  const id = open ? "simple-popover" : undefined

  return (
    <>
      <Typography aria-describedby={id} onClick={handleClick} variant="s1" sx={styles.documentText}>
        {`${document?.length} ${document?.length == 1 ? "Document" : "Documents"}`}
      </Typography>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}>
        <Grid container style={{ padding: "2px" }}>
          <Grid
            item
            style={{
              boxShadow: "0px 0px 2px rgba(58, 58, 68, 0.12), 0px 2px 4px rgba(90, 91, 106, 0.12)",
              marginTop: "5px"
            }}>
            {document?.map((item, index) => {
              return (
                <Grid key={index} item sx={styles.docNameContainer}>
                  <a
                    style={styles.docName}
                    href={item?.url}
                    onClick={() => ImageLink(item?.url)}
                    target="_blank"
                    rel="noopener noreferrer">
                    {item?.name}
                  </a>
                </Grid>
              )
            })}
          </Grid>
        </Grid>
      </Popover>
    </>
  )
}

export default DownloadDocument
