// INFO : This component will render both 'Details Form' and 'QR Code Card' conditionally on demand

import React from "react"
import PopupModal from "components/PopupModal"
import DetailsForm from "./DetailsForm"
import QRCodeCard from "./QRCodeCard"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"

const CustomerDetailsForm = () => {
  const dispatch = useDispatch()

  const popUpModalName = useSelector((state) => state.wash.popUpModalName)

  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
    // TODO : Need to add dispatch actions for nullyfying customer details and wash details in redux wash slice
  }

  const modalMap = {
    DetailsForm: <DetailsForm handleClose={handleClose} />,
    QRCodeCard: <QRCodeCard handleClose={handleClose} />
  }

  return (
    <PopupModal
      styles={{
        width: "70vw",
        maxHeight: "90vh",
        marginLeft: "auto",
        marginRight: "auto"
      }}
      handleClose={handleClose}>
      {modalMap[popUpModalName]}
    </PopupModal>
  )
}

export default CustomerDetailsForm
