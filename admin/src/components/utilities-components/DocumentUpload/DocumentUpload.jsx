import { CircularProgress, Grid, Typography } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useStyles } from "./DocumentUploadStyles"
import Toast from "../Toast/Toast"
import { DocumentService } from "network/documentService"

function DocumentUpload({
  values = [],
  setValues = () => {},
  deleteValues = () => {},
  title = "PAN_CARD",
  icon
}) {
  const styles = useStyles()
  const inputFile = useRef(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const addFile = (e) => {
    e.stopPropagation()
    inputFile.current.click()
  }

  useEffect(() => {
    setFiles(values)
  }, [])

  const deleteFile = async (file, index) => {
    const filesMap = new Map()
    files.forEach((file) => {
      if (!filesMap.has(file?.url)) {
        filesMap.set(file?.url, file)
      }
    })
    const payload = {
      url: file?.url
    }
    const response = await DocumentService.deleteDocuments(payload)
    if (response?.success) {
      if (filesMap.has(file?.url)) {
        filesMap.delete(file?.url)
      }
      const newFiles = [...files]
      deleteValues(file, newFiles)
      newFiles.splice(index, 1)
      setFiles(Array.from(filesMap.values()))
      setValues(Array.from(filesMap.values()))
    }
    if (response?.success) {
      Toast.showInfoToast(response?.message)
    } else {
      Toast.showErrorToast(response?.message)
    }
  }
  const handleFileChange = async (event) => {
    setLoading(true)
    const file = event.target.files[0]
    if (file && file.size <= 5242880) {
      const payload = {
        doc: file,
        name: title
      }

      const response = await DocumentService.uploadDocument(payload)

      if (response.success && response?.code === 200) {
        setFiles([...files, { name: title, url: response?.data?.url }])
        setValues([...files, { name: title, url: response?.data?.url }])
        Toast.showInfoToast(response?.message)
      } else {
        Toast.showErrorToast(response?.message)
      }
    } else if (file && file.size > 5242880) {
      Toast.showErrorToast("File size should be less than or equal to 5MB")
    }

    setLoading(false)
  }

  return (
    <Grid container alignItems="center">
      <Grid
        item
        xs={12}
        onClick={addFile}
        sx={{
          height: "4rem",
          padding: "3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}>
        {icon}
        <Typography variant="p1" color="primary.main">
          {title}
        </Typography>
        <Typography
          variant="p3"
          sx={{
            marginLeft: "0.2rem", // Applies to all screen sizes
            "@media (min-width: 768px)": {
              marginLeft: "1rem"
            }
          }}
          color="primary.main">
          (upload)
        </Typography>
        <input
          ref={inputFile}
          id="upload"
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </Grid>
      {loading && <CircularProgress style={{ marginLeft: 12, marginBottom: 5 }} size={15} />}
      {files?.findIndex((item) => item?.name == title) != -1
        ? files.length > 0 && (
            <Grid xs container item sx={styles.documentBox}>
              {files
                ?.filter((item) => item?.name == title)
                ?.map((file, index) => (
                  <Grid sx={styles.innerBox} item key={index}>
                    <CheckCircleIcon style={{ marginRight: 12 }} color="success" />
                    <a href={file?.url} download={file?.name}>
                      <Typography sx={styles.documentText} variant="button">
                        {file.name}
                      </Typography>
                    </a>
                    {!loading || index !== files.length - 1 ? (
                      <CancelIcon
                        style={{ marginLeft: 12, cursor: "pointer" }}
                        color="primary"
                        onClick={() => deleteFile(file, index)}
                      />
                    ) : null}
                  </Grid>
                ))}
            </Grid>
          )
        : null}
    </Grid>
  )
}

export default DocumentUpload
