import React, { Fragment, useEffect, useState } from "react"
import DealerForm from "components/DealerPanel/DealerForm"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { dealerActions } from "redux/store"
import { getDealerDetails } from "components/DealerPanel/dealerUtilities"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"

const CreateDealer = () => {
  const user = userDetail()
  const activeStep = useSelector((state) => state.dealer.activeStep)
  const dealerId = useSelector((state) => state.dealer.dealerID)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (activeStep === 0 && dealerId !== "") {
      getDealerDetails(dispatch, dealerActions, setIsLoading, dealerId)
    }
  }, [activeStep])

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(`/${user?.role}/dealers`)
    } else {
      dispatch(dealerActions.setActiveStep(activeStep - 1))
    }
  }
  return (
    <Fragment>
      <CommonHeader
        heading="Create Dealership Profile "
        btnTxt={null}
        backBtn={true}
        backBtnHandler={handleBack}
      />
      {isLoading ? <AppLoader /> : <DealerForm />}
    </Fragment>
  )
}

export default CreateDealer
