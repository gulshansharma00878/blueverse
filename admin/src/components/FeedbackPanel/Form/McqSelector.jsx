import React from "react"
import { IconButton } from "@mui/material"
import RemoveIcon from "@mui/icons-material/Remove"
import AddIcon from "@mui/icons-material/Add"
import InputField from "components/utilities-components/InputField/InputField"
import { useStyles } from "../feedbackStyles"
import ErrorText from "components/utilities-components/InputField/ErrorText"
const McqSelector = (props) => {
  const { item, parentIndex, handleMCQValue, handleMcqOption, isViewOnly } = props
  // returns MCQ Input  and options
  const styles = useStyles()
  return (
    <>
      {item?.mcq_options?.map((option, mcqIndex) => {
        return (
          <div key={mcqIndex} style={styles?.mcqWrapper}>
            <div key={mcqIndex} style={styles?.mcqDel}>
              <div style={{ pointerEvents: isViewOnly && "none" }}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  className="filtericonBox"
                  style={styles?.marginRight8}
                  onClick={handleMcqOption.bind(null, parentIndex, mcqIndex, "del")}>
                  <RemoveIcon color="primary" fontSize="large" />
                </IconButton>
              </div>
              <InputField
                value={option?.value}
                onChange={({ target: { value } }) => handleMCQValue(mcqIndex, parentIndex, value)}
                placeholder={`Option${mcqIndex + 1}`}
                inputProps={{ maxLength: 50, style: { fontSize: "1.6rem" } }}
                disabled={isViewOnly}
                error={option?.error}
                helperText={<ErrorText text={option?.errorText} />}
              />
              {/* {option?.id} */}
            </div>
          </div>
        )
      })}
      <div style={styles?.marginLeft16}>
        <div style={{ pointerEvents: isViewOnly && "none" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            className="filtericonBox"
            onClick={handleMcqOption.bind(null, parentIndex, null, "add")}>
            <AddIcon color="primary" />
          </IconButton>
        </div>
      </div>{" "}
    </>
  )
}
export default McqSelector
