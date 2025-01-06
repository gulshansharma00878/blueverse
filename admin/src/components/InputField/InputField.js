import { TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
const InputField = styled(TextField)({
  "& .MuiFilledInput-root": {
    height: "54px",
    border: "1px solid #e2e2e1",
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#fff",
    "&.Mui-focused": {
      borderColor: "#1F59AF"
    },
    background: "#fff"
  },
  background: "#fff",
  backgroundColor: "#fff"
})

export default InputField
