import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  popUpModalName: "", // values = 'DetailsForm' or 'QRCodeCard'
  isEditable: false,
  userDetails: null,
  tileDetails: null,
  tileUpdateCount: 0
}

const washSlice = createSlice({
  name: "wash-slice",
  initialState: initialState,
  reducers: {
    setPopupModalName: (state, action) => {
      state.popUpModalName = action.payload
    },
    setIsEditable: (state, action) => {
      state.isEditable = action.payload
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload
    },
    setTileDetails: (state, action) => {
      state.tileDetails = action.payload
    },
    setTileUpdateCounter: (state) => {
      state.tileUpdateCount = state.tileUpdateCount + 1
    }
  }
})

export default washSlice
