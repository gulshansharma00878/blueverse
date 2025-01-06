import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  billingTabActive: 0
}

const billingSlice = createSlice({
  name: "bulling-slice",
  initialState: initialState,
  reducers: {
    setBillingTabActive: (state, action) => {
      state.billingTabActive = action.payload
    }
  }
})

export default billingSlice
