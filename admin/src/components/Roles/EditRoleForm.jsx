import React, { forwardRef, useState, useEffect } from "react"
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import styles from "./CreateRoleForm.module.scss"
import EditPermission from "./EditPermission"
import { RoleService } from "network/roleService"
import { modifyPermissionObj } from "helpers/Functions/roleFunction"
import Toast from "components/utilities-components/Toast/Toast"
import { useNavigate } from "react-router-dom"
import InputField from "components/utilities-components/InputField/InputField"
import ErrorText from "components/utilities-components/InputField/ErrorText"
import CustomSwitch from "components/utilities-components/Switch/CustomSwitch"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"

const EditRoleForm = forwardRef((props, ref) => {
  const { subRoleDetail } = props
  const navigate = useNavigate()
  const [modulePermission, setModulePermission] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [optionSelectAll, setOptionSelectAll] = useState(null)

  useEffect(() => {
    if (subRoleDetail?.permission && subRoleDetail?.permission.length > 0) {
      setModulePermission(subRoleDetail?.permission)
    } else {
      setModulePermission([])
    }
  }, [subRoleDetail])

  useEffect(() => {
    // for handle Main select all checkbox
    const allPermissionsTrue = modulePermission.every((item) => {
      setOptionSelectAll({ ...optionSelectAll, [item.module.name]: false })
      return Object.values(item.permissionObj).every((value) => value)
    })
    setSelectAll(allPermissionsTrue)

    // for handle Module level select all checkbox
    const newModulePermissions = {}
    modulePermission.forEach((module) => {
      const allPermissions = Object.values(module.permissionObj).every(
        (permission) => permission === true
      )
      newModulePermissions[module.module.name] = allPermissions
    })
    setOptionSelectAll(newModulePermissions)
  }, [modulePermission])

  const handleSubmit = async (data) => {
    const modifiedData = modifyPermissionObj(modulePermission)

    const payLoad = {
      name: data?.roleName,
      isActive: data?.activeCheck,
      permissions: modifiedData
    }

    if (data.description) {
      payLoad.description = data.description
    }

    const param = [subRoleDetail?.subRoleId]
    let subRoleResponse = await RoleService.editSubRoleById(payLoad, param)
    if (subRoleResponse.code === 200 && subRoleResponse.success) {
      Toast.showInfoToast(`${subRoleResponse?.message}`)
      navigate(-1)
    } else {
      Toast.showErrorToast(`${subRoleResponse?.message}`)
    }
  }

  const initialValues = {
    roleName: subRoleDetail?.name ? subRoleDetail?.name : "",
    description: subRoleDetail?.description ? subRoleDetail?.description : "",
    activeCheck: subRoleDetail?.isActive ? true : false
  }

  const validationSchema = Yup.object().shape({
    roleName: Yup.string().required("Role Name is required")
  })

  const handleCheckboxChange = (event, itemName, permissionName) => {
    const checked = event.target.checked
    const updatedPermissions = modulePermission.map((item) => {
      if (item.module.name === itemName) {
        if (permissionName !== "viewPermission") {
          return {
            ...item,
            permissionObj: {
              ...item.permissionObj,
              viewPermission: true,
              [permissionName]: checked
            }
          }
        } else if (permissionName === "viewPermission" && checked === false) {
          return {
            ...item,
            permissionObj: Object.keys(item.permissionObj).reduce(
              (acc, key) => ({
                ...acc,
                [key]: checked
              }),
              {}
            )
          }
        } else {
          return {
            ...item,
            permissionObj: {
              ...item.permissionObj,
              [permissionName]: checked
            }
          }
        }
      } else {
        return item
      }
    })
    setModulePermission(updatedPermissions)
    setSelectAll(false)
  }

  const handleSelectAllChange = (event) => {
    const checked = event.target.checked
    const updatedPermissions = modulePermission.map((item) => ({
      ...item,
      permissionObj: Object.keys(item.permissionObj).reduce(
        (acc, key) => ({
          ...acc,
          [key]: checked
        }),
        {}
      )
    }))
    setModulePermission(updatedPermissions)
    setSelectAll(checked)
  }

  const handleClearAllChange = () => {
    const updatedPermissions = modulePermission.map((item) => ({
      ...item,
      permissionObj: Object.keys(item.permissionObj).reduce(
        (acc, key) => ({
          ...acc,
          [key]: false
        }),
        {}
      )
    }))
    setModulePermission(updatedPermissions)
    setSelectAll(false)
  }

  const handleModuleSelectAll = (event, itemName) => {
    const checked = event.target.checked
    const updatedPermissions = modulePermission.map((item) => {
      if (item.module.name === itemName) {
        setOptionSelectAll({
          ...optionSelectAll,
          [itemName]: checked
        })
        return {
          ...item,
          permissionObj: Object.keys(item.permissionObj).reduce(
            (acc, key) => ({
              ...acc,
              [key]: checked
            }),
            {}
          )
        }
      } else {
        return item
      }
    })
    setModulePermission(updatedPermissions)
  }

  return (
    <Box>
      <Formik
        innerRef={ref}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {(formik) => {
          return (
            <Form>
              <Box className={styles.form_container}>
                <Box className={styles.input_box}>
                  <InputField
                    className={styles.input_field}
                    size="medium"
                    name="roleName"
                    label="Role Name*"
                    InputLabelProps={{
                      shrink: formik.values.roleName
                    }}
                    InputProps={{ disableUnderline: true }}
                    value={formik.values.roleName}
                    variant="filled"
                    onChange={(e) => {
                      formik.setFieldValue("roleName", e.target.value)
                    }}
                    helperText={
                      formik.errors.roleName ? <ErrorText text={formik.errors?.roleName} /> : ""
                    }
                    error={formik.touched.roleName && Boolean(formik.errors.roleName)}
                    fullWidth
                    margin="normal"
                  />
                </Box>
                <Box className={styles.input_box}>
                  <InputField
                    className={styles.input_field}
                    size="medium"
                    name="description"
                    label="Description of Role"
                    InputLabelProps={{
                      shrink: formik.values.description
                    }}
                    InputProps={{ disableUnderline: true }}
                    value={formik.values.description}
                    variant="filled"
                    onChange={(e) => {
                      formik.setFieldValue("description", e.target.value)
                    }}
                    helperText={
                      formik.errors.description ? (
                        <ErrorText text={formik.errors?.description} />
                      ) : (
                        ""
                      )
                    }
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    fullWidth
                    margin="normal"
                  />
                </Box>
                <Box className={styles.status_box}>
                  <Typography variant="p1" className={styles.status_lable}>
                    Status
                  </Typography>
                  <CustomSwitch
                    handleChange={formik.handleChange}
                    label={formik.values.activeCheck ? "Active" : "Inactive"}
                    value={formik.values.activeCheck}
                    name="activeCheck"
                  />
                </Box>
              </Box>
              <Box className={styles.permission_box}>
                <Box className={styles.permission_header}>
                  <Typography variant="h7">Select Module Level Permissions</Typography>
                  <SecondaryButton sx={{ width: "14rem" }} onClick={handleClearAllChange}>
                    Clear All
                  </SecondaryButton>
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      disableRipple
                      sx={{
                        transform: "scale(0.8)",
                        "& .MuiSvgIcon-root": {
                          fontSize: 24,
                          color: selectAll ? "primary" : "background.grey5"
                        },
                        marginRight: "1.1rem"
                      }}
                      className={styles.checkbox_icon}
                      onChange={handleSelectAllChange}
                      checked={selectAll}
                    />
                  }
                  label={<span className={styles.filter_popup_label}>Select All</span>}
                  className={styles.filter_popup_checkbox}
                />
                <Box className={styles.checkbox_box_container}>
                  <Box className={styles.permission_list_container}>
                    {modulePermission.map((item, index) => (
                      <EditPermission
                        key={index}
                        name={item?.module?.name}
                        item={item}
                        selectAllchecked={optionSelectAll && optionSelectAll[item?.module?.name]}
                        handleModuleSelectAll={handleModuleSelectAll}
                        handleCheckboxChange={handleCheckboxChange}
                        isEdit={true}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Form>
          )
        }}
      </Formik>
    </Box>
  )
})

EditRoleForm.displayName = "EditRoleForm"

export default EditRoleForm
