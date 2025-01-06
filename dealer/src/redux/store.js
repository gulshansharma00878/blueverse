import { combineReducers, configureStore } from "@reduxjs/toolkit"
import AppSlice from "./slices/appSlice"
import storage from "redux-persist/lib/storage"
import { persistReducer, persistStore } from "redux-persist"
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2"
import thunk from "redux-thunk"
import billingSlice from "./slices/billingSlice"
import machineSlice from "./slices/manageMachineSlice"
const persistConfig = {
  key: "root",
  storage,
  stateReconciler: autoMergeLevel2,
  blacklist: ["dealer"]
}

const allReducer = combineReducers({
  app: AppSlice.reducer,
  billing: billingSlice.reducer,
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
export const billingActions = billingSlice.actions
export const machineAction = machineSlice.actions
