import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  agentDetail: {}
}

const agentSlice = createSlice({
  name: "agent-slice",
  initialState: initialState,
  reducers: {
    setAgentDetail: (state, action) => {
      state.agentDetail = action.payload
    }
  }
})

export default agentSlice
