import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: {},
  authToken: null,
  resetPassword: { email: "", verification_code: "" },
  isLogged: false,
  popUpModalState: false, // False => Card is Closed, True => Open
  deviceToken: false,
  firebaseToken: "",
  tokenStored: false,
  refetch: ""
}

export const appSlice = createSlice({
  name: "app-base",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user
      state.authToken = action.payload.authToken
      state.isLogged = true
    },
    logout: (state) => {
      state.user = {}
      state.authToken = null
      state.isLogged = false
    },
    updatePopupModal: (state, action) => {
      state.popUpModalState = action.payload
    },
    setResetPassword: (state, action) => {
      state.resetPassword = action.payload
    },
    setToken: (state, action) => {
      state.deviceToken = action.payload
    },
    setFirebaseToken: (state, action) => {
      state.firebaseToken = action.payload
    },
    setTokenStored: (state, action) => {
      state.tokenStored = action.payload
    },
    setRefetch: (state, action) => {
      state.refetch = action.payload
    }
  }
})

export default appSlice
