import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  stateData: {},
  citiesData: {},
  oemData: {},
  pageData: {},
  tabActive: 0
}

const cmsSlice = createSlice({
  name: "cms-slice",
  initialState: initialState,
  reducers: {
    setStateData: (state, action) => {
      state.stateData = action.payload
    },
    setCityData: (state, action) => {
      state.citiesData = action.payload
    },
    setOemData: (state, action) => {
      state.oemData = action.payload
    },
    setPageData: (state, action) => {
      state.pageData = action.payload
    },
    setTabActive: (state, action) => {
      state.tabActive = action.payload
    }
  }
})

export default cmsSlice
