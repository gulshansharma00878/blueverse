import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const QuestionItem = ({ index, question, answer, isMandatory }) => {
  return (
    <Box sx={{ padding: "1.2rem", backgroundColor: "background.default" }}>
      <Typography variant="p2" color="text.gray" sx={{ fontWeight: "500" }} component="p">
        Q{index}: {question}
        {isMandatory && "*"}
      </Typography>
      <Typography variant="p2" color="text.main" sx={{ fontWeight: "400" }} component="p">
        {answer}
      </Typography>
    </Box>
  )
}

export default QuestionItem
