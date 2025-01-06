import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  areaManagerDetails: {},
  editAreaManager: false
}

const areaManagerSlice = createSlice({
  name: "areaManager-slice",
  initialState: initialState,
  reducers: {
    setAreaManagerDetails: (state, action) => {
      state.areaManagerDetails = action.payload
    },
    setEditAreaManager: (state, action) => {
      state.editAreaManager = action.payload
    }
  }
})

export default areaManagerSlice
