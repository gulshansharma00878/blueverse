import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  subAdminDetails: {},
  editSubAdmin: false
}

const subAdminSlice = createSlice({
  name: "subAdmin-slice",
  initialState: initialState,
  reducers: {
    setSubAdminDetail: (state, action) => {
      state.subAdminDetails = action.payload
    },
    setEditSubAdmin: (state, action) => {
      state.editSubAdmin = action.payload
    }
  }
})

export default subAdminSlice
