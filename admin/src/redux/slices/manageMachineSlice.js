import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  activeTab: 0
}

const machineSlice = createSlice({
  name: "feedback-slice",
  initialState: initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    }
  }
})

export default machineSlice
