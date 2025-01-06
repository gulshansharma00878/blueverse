import React, { forwardRef, useState, useEffect } from "react"
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material"
import { Formik, Form } from "formik"
import InputField from "components/utilities-components/InputField/InputField"
import * as Yup from "yup"
import styles from "./CreateRoleForm.module.scss"
import Permission from "./Permission"
import { RoleService } from "network/roleService"
import { modifyPermissionKeys, removeFalsePermissions } from "helpers/Functions/roleFunction"
import Toast from "components/utilities-components/Toast/Toast"
import { useNavigate } from "react-router-dom"
import ErrorText from "components/utilities-components/InputField/ErrorText"
import CustomSwitch from "components/utilities-components/Switch/CustomSwitch"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"

const CreateRoleForm = forwardRef((props, ref) => {
  const navigate = useNavigate()
  const { roleType, dealerId } = props
  const [modulePermission, setModulePermission] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [optionSelectAll, setOptionSelectAll] = useState(null)

  useEffect(() => {
    moduleList()
  }, [])

  useEffect(() => {
    // for handle Main select all checkbox
    const allPermissionsTrue = modulePermission.every((item) => {
      setOptionSelectAll({ ...optionSelectAll, [item.name]: false })
      return Object.values(item.permissions).every((value) => value)
    })
    setSelectAll(allPermissionsTrue)

    // for handle Module level select all checkbox
    const newModulePermissions = {}
    modulePermission.forEach((module) => {
      const allPermissions = Object.values(module.permissions).every(
        (permission) => permission === true
      )
      newModulePermissions[module.name] = allPermissions
    })
    setOptionSelectAll(newModulePermissions)
  }, [modulePermission])

  const moduleList = async () => {
    const param = {
      type: roleType
    }
    let moduleResponse = await RoleService.getModuleList(param)
    if (moduleResponse.code === 200 && moduleResponse.success) {
      let updatePermissionData = removeFalsePermissions(moduleResponse?.data?.modules)
      setModulePermission(updatePermissionData)
    } else {
      setModulePermission([])
    }
  }

  const handleSubmit = async (data) => {
    const modifiedData = modifyPermissionKeys(modulePermission)

    const payLoad = {
      name: data.roleName,
      isActive: data.activeCheck,
      permissions: modifiedData,
      ...(dealerId != "" && { dealerId: dealerId })
    }

    if (data.description) {
      payLoad.description = data.description
    }
    let subRoleResponse = await RoleService.createSubRole(payLoad)
    if (subRoleResponse.code === 200 && subRoleResponse.success) {
      Toast.showInfoToast(`${subRoleResponse?.message}`)
      navigate(-1)
    } else {
      Toast.showErrorToast(`${subRoleResponse?.message}`)
    }
  }

  const initialValues = {
    roleName: "",
    description: "",
    activeCheck: true
  }

  const validationSchema = Yup.object().shape({
    roleName: Yup.string().required("Role Name is required")
  })

  const handleCheckboxChange = (event, itemName, permissionName) => {
    const checked = event.target.checked
    const updatedPermissions = modulePermission.map((item) => {
      if (item.name === itemName) {
        if (permissionName !== "view") {
          return {
            ...item,
            permissions: {
              ...item.permissions,
              view: true,
              [permissionName]: checked
            }
          }
        } else if (permissionName === "view" && checked === false) {
          return {
            ...item,
            permissions: Object.keys(item.permissions).reduce(
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
            permissions: {
              ...item.permissions,
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
      permissions: Object.keys(item.permissions).reduce(
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
      permissions: Object.keys(item.permissions).reduce(
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
      if (item.name === itemName) {
        setOptionSelectAll({
          ...optionSelectAll,
          [itemName]: checked
        })
        return {
          ...item,
          permissions: Object.keys(item.permissions).reduce(
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
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={ref}>
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
                    // inputProps={{ style: { height: "2.5rem" } }}
                    InputProps={{ disableUnderline: true }}
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
                    // inputProps={{ style: { height: "2.5rem" } }}
                    InputProps={{ disableUnderline: true }}
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
                      className={styles.checkbox_icon}
                      sx={{
                        transform: "scale(0.8)",
                        "& .MuiSvgIcon-root": {
                          fontSize: 24,
                          color: selectAll ? "primary" : "background.grey5"
                        },
                        marginRight: "1.1rem"
                      }}
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      disableRipple
                    />
                  }
                  label={<span className={styles.filter_popup_label}>Select All</span>}
                  className={styles.filter_popup_checkbox}
                />
                <Box className={styles.checkbox_box_container}>
                  <Box className={styles.permission_list_container}>
                    {modulePermission.map((item, index) => (
                      <Permission
                        key={index}
                        name={item.name}
                        item={item}
                        handleModuleSelectAll={handleModuleSelectAll}
                        handleCheckboxChange={handleCheckboxChange}
                        selectAllchecked={optionSelectAll && optionSelectAll[item.name]}
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

CreateRoleForm.displayName = "CreateRoleForm"

export default CreateRoleForm
