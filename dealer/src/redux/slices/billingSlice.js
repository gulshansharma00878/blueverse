import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  isTopUp: false,
  billingTabActive: 0
}

const billingSlice = createSlice({
  name: "bulling-slice",
  initialState: initialState,
  reducers: {
    setIsTopUp: (state, action) => {
      state.isTopUp = action.payload
    },
    setBillingTabActive: (state, action) => {
      state.billingTabActive = action.payload
    }
  }
})

export default billingSlice
