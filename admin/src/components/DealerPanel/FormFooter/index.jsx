import React from "react"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import Box from "@mui/system/Box"
import "./formFooter.scss"
import useMediaQuery from "@mui/material/useMediaQuery"
import CommonFooter from "components/utilities-components/CommonFooter"

const FormFooter = ({ btnDisable, clickHandler, btnLabel, style = {} }) => {
  const isMobile = useMediaQuery("(max-width:600px)")

  const ActionButton = () => {
    return (
      <PrimaryButton
        onClick={clickHandler}
        disabled={btnDisable}
        sx={{ width: { sm: "22.9rem", xs: "100%" } }}>
        {btnLabel}
      </PrimaryButton>
    )
  }
  return (
    <>
      {isMobile ? (
        <CommonFooter>
          <ActionButton />
        </CommonFooter>
      ) : (
        <Box className="formFooter" sx={style}>
          <ActionButton />
        </Box>
      )}
    </>
  )
}

export default FormFooter
