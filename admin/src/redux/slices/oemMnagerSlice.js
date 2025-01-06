import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  editOemManager: false
}

const oemManagerSlice = createSlice({
  name: "oemManager-slice",
  initialState: initialState,
  reducers: {
    setEditOemManager: (state, action) => {
      state.editOemManager = action.payload
    }
  }
})

export default oemManagerSlice
