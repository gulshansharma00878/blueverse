import { Box } from "@mui/system"
// import { PageHeader } from "components/FeedbackPanel/FeedbackListing/PageHeader"
import React, { useState } from "react" // , { useState }
import Banner from "assets/images/placeholders/mobile_banner.webp"
import InputField from "components/utilities-components/InputField/InputField"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import CheckCircleIcon from "@mui/icons-material/CheckCircle" // import CircleCheckedFilled from "@material-ui/icons/CheckCircle"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import { Checkbox, FormControlLabel, MenuItem, Rating, Typography } from "@mui/material"
import { useStyles } from "../feedbackStyles"
// import { PageHeader } from "../FeedbackListing/PageHeader"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
const PreviewForm = ({ items, handleBack }) => {
  const [index, setIndex] = useState(0)
  const [selectedMcq, setSelectedMcq] = useState("")
  const [starGiven, setStarGiven] = useState(0)
  const [comment, setComment] = useState("")
  const styles = useStyles()
  const getCommentInput = (item) => {
    return (
      <InputField
        multiline
        style={styles?.fullWidth}
        inputProps={{
          style: styles?.mobileInput,
          maxLength: item?.comment?.maxChar
        }}
        variant="outlined"
        value={comment}
        onChange={({ target: { value } }) => setComment(value)}
      />
    )
  }
  const handleSelect = (value) => {
    setSelectedMcq(value)
  }
  const getMCQInput = (mcqQtions) => {
    return (
      <Box sx={{ maxHeight: "200px" }}>
        {mcqQtions.map((item) => (
          <MenuItem
            disableRipple
            disableTouchRipple
            key={item?.id}
            className={"select_item_second"}>
            <FormControlLabel
              control={
                <Checkbox
                  key={item?.id}
                  checked={selectedMcq === item?.value}
                  onChange={handleSelect.bind(null, item?.value)}
                  value={item?.value}
                  icon={<RadioButtonUncheckedIcon color="primary" />}
                  checkedIcon={<CheckCircleIcon color="primary" />}
                />
              }
              label={
                <Typography variant="p1" sx={styles?.smallMarginLeft}>
                  {item?.value}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Box>
    )
  }
  const getStarsInput = (startInputs, starOptions) => {
    return (
      <Box sx={[styles?.display, styles?.align, styles?.justify, styles?.fullWidth]}>
        <Rating
          name="customized-10"
          defaultValue={2}
          max={starOptions}
          size="large"
          value={starGiven}
          onChange={(event, newValue) => {
            setStarGiven(newValue)
          }}
        />
      </Box>
    )
  }
  const handleIndex = (i, key) => {
    if (key === "minus") {
      setIndex(i - 1)
    } else if (key === "add") {
      setIndex(i + 1)
    }
  }
  return (
    <>
      <CommonHeader heading="Back to form Editor" backBtn backBtnHandler={handleBack} />
      <Box sx={[styles?.display, styles?.align, styles?.justify, styles?.previewContainer]}>
        <Box sx={styles?.mobile}>
          <img src={Banner} alt="" style={styles?.moblileBanner} />
          <Box sx={{ padding: "16px" }}>
            <Typography sx={styles?.questionContainer}>
              {" "}
              {items[index]?.title}
              {items[index]["isOptional"] ? "" : "*"}
            </Typography>
            <Box sx={styles?.overFlow}>
              {" "}
              {items[index]?.type === "COMMENT" && getCommentInput(items[index])}
            </Box>
            <Box sx={styles?.overFlow}>
              {" "}
              {items[index]?.type === "MULTIPLE_CHOICE" && getMCQInput(items[index]?.mcq_options)}
            </Box>
            <Box sx={styles?.overFlow}>
              {items[index]?.type === "RATING" &&
                getStarsInput(items[index]?.star_options, items[index]?.starOptions)}
            </Box>
          </Box>
          <Box sx={[styles?.display, styles?.align, styles?.justifyAround, styles?.footer]}>
            <SecondaryButton
              onClick={handleIndex.bind(null, index, "minus")}
              style={styles?.mobileButton}
              disabled={index === 0}>
              Back
            </SecondaryButton>
            <PrimaryButton
              onClick={handleIndex.bind(null, index, "add")}
              style={styles?.mobileButton}
              disabled={index === items?.length - 1 || items?.length === 0}>
              Next
            </PrimaryButton>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default PreviewForm
