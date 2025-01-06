import React, { useEffect, useState } from "react"
import EditRole from "pages/private/common-pages/roles/EditRole"
import { useLocation } from "react-router-dom"

function EditDealerRole() {
  const location = useLocation()
  const [dealerId, setDealerId] = useState("")

  useEffect(() => {
    const val = location?.state
    setDealerId(val?.dealerId)
  }, [location])

  return <EditRole dealerId={dealerId} />
}

export default EditDealerRole
