// INFO : This page will render when user tries to edit the dealer details.
import React, { useEffect, useState } from "react"
import DealerForm from "components/DealerPanel/DealerForm"
import { useParams } from "react-router-dom"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import CommonHeader from "components/utilities-components/CommonHeader/CommonHeader"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { dealerActions } from "redux/store"
import { getDealerDetails } from "components/DealerPanel/dealerUtilities"
import { userDetail } from "hooks/state"

const EditDealer = () => {
  const user = userDetail()
  const activeStep = useSelector((state) => state.dealer.activeStep)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (activeStep === 0) {
      getDealerDetails(dispatch, dealerActions, setIsLoading, params?.id)
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
    <>
      <CommonHeader
        heading="Edit Dealership Profile"
        btnTxt={null}
        backBtn={true}
        backBtnHandler={handleBack}
      />
      {isLoading ? <AppLoader /> : <DealerForm isEdit={true} />}
    </>
  )
}

export default EditDealer
