import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  formDetails: null,
  isEdit: false,
  isViewOnly: false
}

const feedBackSlice = createSlice({
  name: "feedback-slice",
  initialState: initialState,
  reducers: {
    setFormDetails: (state, action) => {
      state.formDetails = action.payload
    },
    setIsEdit: (state, action) => {
      state.isEdit = action.payload
    },
    setIsViewOnly: (state, action) => {
      state.isViewOnly = action.payload
    }
  }
})

export default feedBackSlice
