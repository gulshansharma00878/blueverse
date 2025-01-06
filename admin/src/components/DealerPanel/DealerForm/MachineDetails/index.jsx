import React, { useEffect, useState } from "react"
import FormFooter from "../../FormFooter"
import Box from "@mui/system/Box"
import Grid from "@mui/material/Grid"
import { useDispatch, useSelector } from "react-redux"
// import { dealerActions } from "redux/store"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import DropDown from "components/utilities-components/DropDown/DropDown"
import MultiSelect from "components/utilities-components/Mulit-Select/MultiSelect"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import AddIcon from "@mui/icons-material/Add"
import SelectedDetails from "./SelectedDetails"
import styles from "./machineDetails.module.scss"
import Stack from "@mui/system/Stack"
import deleteIcon from "assets/images/icons/deleteIcon.svg"
import greenTickIcon from "assets/images/icons/greenTickIcon.svg"
import {
  getAllAvailableMachines,
  getAllAvailableOutlets,
  checkRowCompletion,
  prepareCurrentMapping,
  prepareCreate_MO_Mapping,
  prepareEdit_MO_Mapping
} from "../../dealerUtilities"
import { DealerService } from "network/dealerService"
import Toast from "components/utilities-components/Toast/Toast"
import { dealerActions } from "redux/store"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import useMediaQuery from "@mui/material/useMediaQuery"
import IconWrapper from "components/utilities-components/IconWrapper"

const MachineDetails = ({ isEdit = false }) => {
  const [btnDisabled, setBtnDisabled] = useState(true)
  const activeStep = useSelector((state) => state.dealer.activeStep)
  const [selectedData, setSelectedData] = useState([
    { outlet: "", machine: [], state: "", city: "", region: "", outletName: "" }
  ])
  const [editRowIdx, setEditRowIdx] = useState(null)
  const [machineData, setMachineData] = useState()
  const [outletData, setOutletData] = useState()
  const dealerID = useSelector((state) => state.dealer.dealerID)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const isMobile = useMediaQuery("(max-width:600px)")

  const dispatch = useDispatch()

  useEffect(() => {
    getAllList()
  }, [])

  async function getAllList() {
    setIsLoading(true)
    const params = [`?dealerIds=${dealerID}`]
    // const param = [`?offset=${currentPage}&limit=${itemsPerPage}&username=${searchQuery}`]
    const [machine, outlet] = await Promise.all([
      DealerService.getMachineList(),
      DealerService.getOutletList(params)
    ])

    let editMode
    if (outlet.success && outlet.code === 200) {
      // Parsing data so that we can fill it for outlet-machine mapping in edit-case
      editMode = !!outlet?.data?.outlets?.find((x) => x.machines.length)
      if (editMode) {
        // If machines array is empty, means outlet-machine mapping is not done.
        const parsed = prepareCurrentMapping(outlet?.data?.outlets)
        checkDataCompletion(parsed)
        setSelectedData(parsed)
      }
      setIsEditMode(editMode)
      setOutletData(outlet?.data)
    } else {
      Toast.showErrorToast(outlet?.message)
    }
    if (machine.success && machine.code === 200) {
      const machineData = machine?.data?.machines ? machine?.data?.machines : []
      if (outlet.success && outlet.code === 200 && editMode) {
        // This is required as machines list excludes already selected machines.
        // Hence in edit-mode, we need to add those selected machines to this list of machines.
        const oldMachSelected = outlet?.data?.outlets?.flatMap((x) => x?.machines)
        setMachineData([...oldMachSelected, ...machineData])
      } else {
        setMachineData(machineData)
      }
    } else {
      Toast.showErrorToast(machine?.message)
    }
    setIsLoading(false)
  }

  const fullData = {
    outlets: outletData?.outlets?.map((item) => ({
      label: item?.name,
      value: item?.outletId
    })),
    machines: machineData?.map((item) => ({
      label: item?.name,
      value: item?.machineGuid
    }))
  }

  const handleSubmit = async () => {
    let response
    setIsLoading(true)
    if (isEditMode) {
      const payload = prepareEdit_MO_Mapping(selectedData, outletData?.outlets)
      if (payload.data.length === 0) {
        dispatch(dealerActions.setActiveStep(activeStep + 1))
      } else {
        response = await DealerService.updateOutletMachineMapping(payload, dealerID)
      }
    } else {
      const payload = prepareCreate_MO_Mapping(selectedData)
      response = await DealerService.addMachine(payload)
    }
    if (response?.success && response?.code === 200) {
      Toast.showInfoToast(response?.message)
      dispatch(dealerActions.setActiveStep(activeStep + 1))
    } else {
      Toast.showErrorToast(response?.message)
    }
    setIsLoading(false)
  }

  const checkDataCompletion = (data) => {
    const isDataComplete =
      data.length > 0 &&
      data.every((x) => {
        if (isEdit) {
          return x.outlet !== ""
        } else {
          return x.machine?.length > 0 && x.outlet !== ""
        }
      })

    setBtnDisabled(!isDataComplete)
  }
  const addOutletHandler = () => {
    const temp = [
      ...selectedData,
      { outlet: "", machine: [], state: "", city: "", region: "", outletName: "" }
    ]
    setSelectedData([...temp])
    checkDataCompletion(temp)
  }

  const outletSelector = (index, value) => {
    const selectedOutlet = outletData.outlets.find(
      (outlet) => outlet.outletId == value.target.value
    )

    setSelectedData((prev) => {
      prev[index].outlet = value.target.value
      prev[index].state = selectedOutlet?.city?.state?.name
      prev[index].city = selectedOutlet?.city?.name
      prev[index].region = selectedOutlet?.city?.state?.region?.name
      prev[index].outletName = selectedOutlet?.name

      checkDataCompletion(prev)
      return [...prev]
    })
  }
  const machineSelector = (index, value) => {
    setSelectedData((prev) => {
      prev[index].machine = value

      checkDataCompletion(prev)
      return [...prev]
    })
  }

  const removeOutlet = (index) => {
    const result = confirm("Do you really want to delete this mapping ?")
    if (result) {
      const temp = [...selectedData]
      temp.splice(index, 1)
      setSelectedData([...temp])
      if (index === editRowIdx) setEditRowIdx(null)
      checkDataCompletion(temp)
      Toast.showInfoToast("Mapping deleted successfully")
    }
  }

  const editDataHandler = (index) => {
    setEditRowIdx(index)
  }

  const SelectionContainer = ({ index }) => {
    return (
      <Stack spacing={1}>
        {index > 0 && <Divider className={styles["selectionDivider"]} />}
        <Typography variant="s1">
          Select machines to be allocated to this Dealership profile?
        </Typography>
        <Grid container>
          {!checkRowCompletion(selectedData, index) || index === editRowIdx ? (
            <Grid item xs={10.5} container>
              <Grid item xs={12} sm={6} className={styles["dropdown"]}>
                <DropDown
                  items={getAllAvailableOutlets(selectedData, fullData, index)}
                  label="Select Service Centre"
                  handleChange={outletSelector.bind(null, index)}
                  value={selectedData[index].outlet}
                />
              </Grid>
              <Grid item xs={12} sm={6} className={styles["multiSelect"]}>
                <MultiSelect
                  items={getAllAvailableMachines(selectedData, fullData, index)}
                  selectedItems={selectedData[index].machine}
                  onSelect={(value) => machineSelector(index, value)}
                  searchEnabled
                  selectAll
                  label="Select Machine"
                  searchPlaceholder="Search Machine"
                  style={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid item xs={10.5} className={styles["selectedDataContainer"]}>
              <SelectedDetails
                editDataHandler={editDataHandler}
                index={index}
                selectedData={selectedData}
              />
            </Grid>
          )}
          <Grid item xs={1.5} className={styles["buttonSectionMD"]}>
            <IconWrapper
              imgSrc={deleteIcon}
              clickHandler={removeOutlet.bind(null, index)}
              wrapperStyle={{
                visibility: selectedData?.length > 1 ? "visible" : "hidden",
                cursor: "pointer"
              }}
            />
            <IconWrapper
              imgSrc={greenTickIcon}
              clickHandler={
                checkRowCompletion(selectedData, index)
                  ? () => {
                      setEditRowIdx(null)
                    }
                  : null
              }
              wrapperStyle={{
                visibility: index === editRowIdx ? "visible" : "hidden",
                cursor: checkRowCompletion(selectedData, index) ? "pointer" : "not-allowed"
              }}
            />
          </Grid>
        </Grid>
      </Stack>
    )
  }

  return (
    <Box>
      {selectedData.map((item, index) => (
        <div key={index}>
          <SelectionContainer index={index} selectedMachines={item.machine} />
        </div>
      ))}
      {selectedData?.length !== outletData?.outlets?.length && (
        <>
          {isMobile ? <Divider className={styles["selectionDivider"]} /> : null}
          <PrimaryButton
            startIcon={<AddIcon />}
            className={styles["outletButton"]}
            onClick={addOutletHandler}
            disabled={selectedData?.length === outletData?.outlets?.length}>
            <Typography variant="p1">Select Another Service Centre</Typography>
          </PrimaryButton>
        </>
      )}
      {!isMobile ? <Divider className={styles["selectionDivider"]} /> : null}
      <FormFooter
        style={{ alignItems: "center" }}
        btnDisable={btnDisabled}
        clickHandler={handleSubmit}
        btnLabel="Assign Machine"
      />
      {isLoading && <AppLoader />}
    </Box>
  )
}

export default MachineDetails
