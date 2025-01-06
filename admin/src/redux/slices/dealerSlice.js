import { createSlice } from "@reduxjs/toolkit"

const calculateMachineSummary = (details) => {
  let minimumPlanCost = details?.machine?.pricing_terms
    .filter((x) => x.isEnabled && (x.plan.manpowerPricePerWash || x.plan.dealerPerWashPrice))
    .map((x) => +x?.plan?.manpowerPricePerWash + +x?.plan?.dealerPerWashPrice)
    .sort((x, y) => x - y)[0]

  minimumPlanCost = minimumPlanCost ? minimumPlanCost : 0

  let taxableAmount = minimumPlanCost * +details.machine.minimum_wash_commitment
  let cgst = Math.floor(taxableAmount * 0.09)
  let sgst = Math.floor(taxableAmount * 0.09)
  let total = Math.floor(taxableAmount + cgst + sgst)
  details.machine["taxable_amount"] = taxableAmount
  details.machine["cgst"] = cgst
  details.machine["sgst"] = sgst
  details.machine["total"] = total

  return details
}

const initialState = {
  activeStep: 0,
  dealerID: "",
  dealerDetails: {},
  dealerFormDetails: {}, // State to store parsed details as per dealer details formik component
  dealerAmount: [],
  outletDetails: [],
  subscriptionDetails: [],
  employeeDetail: {},
  roleDetail: {},
  completionCounter: [],
  dealerTabActive: 0
}

const dealerSlice = createSlice({
  name: "dealer-slice",
  initialState: initialState,
  reducers: {
    setActiveStep: (state, action) => {
      state.activeStep = action.payload
    },
    setDealerId: (state, action) => {
      state.dealerID = action.payload
    },
    setDealerDetails: (state, action) => {
      state.dealerDetails = action.payload
    },
    setDealerAmount: (state, action) => {
      state.dealerAmount = action.payload
    },
    setOutletDetails: (state, action) => {
      state.outletDetails = action.payload
    },
    setSubscriptionDetails: (state, action) => {
      state.subscriptionDetails = action.payload
    },
    updateMachineSettings: (state, action) => {
      let prev = [...state.subscriptionDetails]
      prev[action.payload.index] = calculateMachineSummary(action.payload.details)

      state.subscriptionDetails = prev
    },
    updatePricingTerms: (state, action) => {
      let prev = [...state.subscriptionDetails]
      prev[action.payload.index].machine.pricing_terms[action.payload.planIndex] =
        action.payload.plan

      prev[action.payload.index] = calculateMachineSummary(prev[action.payload.index])
      state.subscriptionDetails = prev
    },
    setDealerFormDetails: (state, action) => {
      state.dealerFormDetails = action.payload
    },
    setEmployeeDetail: (state, action) => {
      state.employeeDetail = action.payload
    },
    setRoleDetail: (state, action) => {
      state.roleDetail = action.payload
    },
    setCompletionCounter: (state, action) => {
      let prev = [...state.completionCounter]
      prev[action.payload.index] = action.payload.check

      state.completionCounter = prev
    },
    resetCompletionCounter: (state) => {
      state.completionCounter = []
    },
    resetDealerStates: (state) => {
      state.activeStep = 0
      state.completionCounter = []
      state.dealerDetails = {}
      state.dealerFormDetails = {}
      state.outletDetails = []
      state.subscriptionDetails = []
      state.dealerID = ""
    },
    setDealerTabActive: (state, action) => {
      state.dealerTabActive = action.payload
    }
  }
})

export default dealerSlice
