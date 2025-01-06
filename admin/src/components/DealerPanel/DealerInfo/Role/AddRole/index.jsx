import CreateRole from "pages/private/common-pages/roles/CreateRole"
import React from "react"
import { useParams } from "react-router-dom"

function AddDealerRole() {
  const params = useParams()
  return <CreateRole roleType="DEALER" dealerId={params?.dealerId} />
}

export default AddDealerRole
