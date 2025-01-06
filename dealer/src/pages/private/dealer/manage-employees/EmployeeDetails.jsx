// INFO : This page will render details for indvidual employee
import React, { useEffect, useState } from "react"
import CommonHeader from "components/utitlities-components/CommonHeader/CommonHeader"
import DetailsSection from "components/ManageEmployees/DetailsSection"
import Divider from "@mui/material/Divider"
import Box from "@mui/material/Box"
import { ManageEmployeeService } from "network/manageEmployeesService"
import { useParams } from "react-router-dom"
import AppLoader from "components/Loader/AppLoader"
import Toast from "components/utitlities-components/Toast/Toast"
import ModulePermissions from "components/ManageEmployees/ModulePermissions"

const EmployeeDetails = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [employeeDetails, setEmployeeDetails] = useState(null)
  const params = useParams()

  useEffect(() => {
    fetchEmployeeDetails()
  }, [params?.id])

  async function fetchEmployeeDetails() {
    setIsLoading(true)
    const response = await ManageEmployeeService.getEmployeeDetails(params?.id)

    if (response.success && response.code === 200) {
      const employeeData = response?.data?.employee
      Toast.showInfoToast(response?.message)

      setEmployeeDetails(employeeData)
    } else {
      Toast.showErrorToast(response?.message)
    }

    setIsLoading(false)
  }

  return (
    <Box>
      <CommonHeader
        heading={employeeDetails?.username ? employeeDetails?.username + " Details" : "Details"}
        backBtn={true}
      />
      <Divider />
      {employeeDetails ? <DetailsSection data={employeeDetails} /> : null}
      {employeeDetails?.subRole?.permission ? (
        <ModulePermissions data={employeeDetails.subRole.permission} />
      ) : null}
      {isLoading ? <AppLoader /> : null}
    </Box>
  )
}

export default EmployeeDetails
