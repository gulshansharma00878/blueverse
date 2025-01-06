import { combineReducers, configureStore } from "@reduxjs/toolkit"
import AppSlice from "./slices/appSlice"
import washSlice from "./slices/washSlice"
import storage from "redux-persist/lib/storage"
import { persistReducer, persistStore } from "redux-persist"
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2"
import thunk from "redux-thunk"
import agentSlice from "./slices/agentSlice"
import dealerSlice from "./slices/dealerSlice"
import cmsSlice from "./slices/cmsSlice"
import feedBackSlice from "./slices/feedBackSlice"
import subAdminSlice from "./slices/subAdminSlice"
import billingSlice from "./slices/billingSlice"
import oemManagerSlice from "./slices/oemMnagerSlice"
import areaManagerSlice from "./slices/areaManagerSlice"
import machineSlice from "./slices/manageMachineSlice"
const persistConfig = {
  key: "root",
  storage,
  stateReconciler: autoMergeLevel2,
  blacklist: ["dealer"]
}

const allReducer = combineReducers({
  app: AppSlice.reducer,
  wash: washSlice.reducer,
  agent: agentSlice.reducer,
  dealer: dealerSlice.reducer,
  cms: cmsSlice.reducer,
  feedBack: feedBackSlice.reducer,
  subAdmin: subAdminSlice.reducer,
  billing: billingSlice.reducer,
  oemManager: oemManagerSlice.reducer,
  areaManager: areaManagerSlice.reducer,
  machine: machineSlice.reducer
})

const persistedReducer = persistReducer(persistConfig, allReducer)

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.REACT_APP_IS_PROD === "false",
  middleware: [thunk]
})

export const persistor = persistStore(store)
export const coreAppActions = AppSlice.actions
export const washActions = washSlice.actions
export const agentActions = agentSlice.actions
export const dealerActions = dealerSlice.actions
export const cmsActions = cmsSlice.actions
export const feedBackActions = feedBackSlice.actions
export const subAdminActions = subAdminSlice.actions
export const billingActions = billingSlice.actions
export const oemMnagerActions = oemManagerSlice.actions
export const areaManagerAction = areaManagerSlice.actions
export const machineAction = machineSlice.actions
