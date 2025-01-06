import React, { useState, useEffect } from "react"
import {
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme
} from "@mui/material"
import Formtype from "components/FeedbackPanel/Form/Formtype"
import PrimaryButton from "components/utilities-components/Button/CommonButton"
import InputField from "components/utilities-components/InputField/InputField"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import {
  newQuestion,
  newMcqOptions,
  maxLength,
  createCommentObject,
  createMCQObject,
  createRATObject,
  sortQuestions,
  charCheck,
  starCheck,
  mcqChek,
  checkQuestion,
  checkTypesSelected
} from "./feedBackUtility"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useStyles } from "./feedBackStyles"
import { useNavigate, useParams } from "react-router-dom"
import McqSelector from "components/FeedbackPanel/Form/McqSelector"
import StarOptions from "components/FeedbackPanel/Form/StarOptions"
import CommentInput from "components/FeedbackPanel/Form/CommentInput"
import DropDown from "components/utilities-components/DropDown/DropDown"
import CustomSwitch from "components/utilities-components/Switch/CustomSwitch"
import OpenWithIcon from "@mui/icons-material/OpenWith"
import { FeedBackService } from "network/feedbackService"
import Toast from "components/utilities-components/Toast/Toast"
import VisibilityIcon from "@mui/icons-material/Visibility"
import PreviewForm from "components/FeedbackPanel/Form/Preview"
import { useSelector, useDispatch } from "react-redux"
import SecondaryButton from "components/utilities-components/SecondaryButton/SecondaryButton"
import { coreAppActions, feedBackActions } from "redux/store"
import PopupModal from "components/PopupModal"
import PopUpChild from "components/utilities-components/PopUpChild"
import RemoveForm from "assets/images/placeholders/remove_form.webp"
import Delete from "assets/images/Common/delete.webp"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { userDetail } from "hooks/state"
import { getPermissionJson } from "helpers/Functions/roleFunction"
import ErrorText from "components/utilities-components/InputField/ErrorText"
import CommonFooter from "components/utilities-components/CommonFooter"

const Form = () => {
  const navigate = useNavigate()
  const user = userDetail()
  const params = useParams()
  const formID = params?.id
  const dispatch = useDispatch()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const formDetails = useSelector((state) => state.feedBack.formDetails)
  const isEdit = useSelector((state) => state.feedBack.isEdit)
  const isViewOnly = useSelector((state) => state.feedBack.isViewOnly)
  const [columns, setColumns] = useState({})
  const styles = useStyles()
  const [isButtonVisible, setIsButtonVisible] = useState(true)
  const [formName, setFormName] = useState("")
  const [formError, setFormError] = useState(false)
  const [formErrorText, setFormErrorText] = useState("")
  const [nameLength, setNameLength] = useState(0)
  const [preview, setPreview] = useState(false)
  const [popUp, setPopUp] = useState(null)
  const [payloadArray, setPayloadArray] = useState(null)
  const [canBePublished, setCanBePublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subAdminPermission, setSubadminPermission] = useState()
  const [isPreview, setIsPreview] = useState(false)
  const [isMcqValuePresent, setIsMcqValuePresent] = useState(false)
  const [isStarValuePresent, setIsStarValuePresent] = useState(false)
  const handleClose = () => {
    dispatch(coreAppActions.updatePopupModal(false))
  }
  // const mobile = useMediaQuery("(max-width:720px)")

  const handleFormName = (value) => {
    setNameLength(value?.length)
    if (/^(?!\s+$).*/.test(value)) {
      setFormName(value)
      setFormError(false)
      setFormErrorText("")
    } else {
      setFormError(true)
      setFormErrorText("First Letter cannot be a space")
    }
  }

  useEffect(() => {
    getAllpermission()
  }, [])

  useEffect(() => {
    createColumns()
    if (formID) {
      getForm(formID)
    }
  }, [])

  async function getAllpermission() {
    if (user.role === "subadmin") {
      if (user?.permissions?.permission.length > 0) {
        let permissionJson = getPermissionJson(user, "published form")
        setSubadminPermission(permissionJson?.permissionObj)
      }
    }
  }

  const handlePreview = () => {
    setPreview((prev) => !prev)
  }
  const createColumns = () => {
    let columnsFromBackend = {
      question: {
        items: []
      }
    }
    setColumns(columnsFromBackend)
  }

  const onAddDel = (id, index, key) => {
    //Add Questions to form
    const objCopy = { ...columns }
    if (key === "add") {
      const questionLength = columns[id]?.items?.length
      const newObj = newQuestion(questionLength + 1)
      objCopy[id].items = [...columns[id].items, newObj]
      setCanBePublished(false)
    } else if (key === "del") {
      //Remove Questions to form
      objCopy[id].items.splice(index, 1)
      handleCheckEmty(objCopy)
      Toast.showErrorToast(`Question Deleted Successfully`)
      !columns?.question?.items?.length && setCanBePublished(false)
    }
    setColumns(objCopy)
  }
  const handleQuestion = (parentIndex, value, key) => {
    // ==> funtion used to update title and optional Question
    const objCopy = { ...columns }
    if (key === "type" && objCopy.question.items[parentIndex]["title"] === "") {
      objCopy.question.items[parentIndex]["titleError"] = true
      objCopy.question.items[parentIndex]["titleErrorText"] = "Enter Question First"
    } else {
      if (value === "MULTIPLE_CHOICE") {
        const newOption = newMcqOptions(0 + 1)
        objCopy.question.items[parentIndex][key] = value
        objCopy.question.items[parentIndex]["mcq_options"] = [newOption]
        objCopy.question.items[parentIndex]["titleError"] = false
        objCopy.question.items[parentIndex]["titleErrorText"] = ""
      } else if (value === "RATING") {
        const threeInput = [
          { id: 1, title: "", value: "", error: true, errorText: "Kindly Fill This Field" },
          { id: 2, title: "", value: "", error: true, errorText: "Kindly Fill This Field" },
          { id: 3, title: "", value: "", error: true, errorText: "Kindly Fill This Field" }
        ]
        objCopy.question.items[parentIndex][key] = value
        objCopy.question.items[parentIndex]["starOptions"] = 3
        objCopy.question.items[parentIndex]["star_options"] = threeInput
        objCopy.question.items[parentIndex]["titleError"] = false
        objCopy.question.items[parentIndex]["titleErrorText"] = ""
      } else {
        objCopy.question.items[parentIndex][key] = value
        objCopy.question.items[parentIndex]["titleError"] = false
        objCopy.question.items[parentIndex]["titleErrorText"] = ""
      }
    }
    handleCheckEmty(objCopy)
    setColumns(objCopy)
  }

  //MCQ BLOCK
  const handleMcqOption = (parentIndex, index, key) => {
    //Using this function we can add or delete MCQ Options
    const objCopy = { ...columns }
    let targetItem = objCopy?.question?.items[parentIndex]?.mcq_options
    let previousItem = targetItem[targetItem?.length - 1]
    //
    if (key === "add") {
      if (previousItem?.value !== "") {
        const newOption = newMcqOptions(previousItem?.id + 1)
        const newTargeItem = [...targetItem, newOption]
        setCanBePublished(false)
        objCopy.question.items[parentIndex].mcq_options = newTargeItem
      } else {
        const newTargeItem = [...targetItem]
        newTargeItem[newTargeItem?.length - 1].error = true
        newTargeItem[newTargeItem?.length - 1].errorText = "Kindly Fill this field first"
        objCopy.question.items[parentIndex].mcq_options = newTargeItem
        setCanBePublished(false)
      }
    } else if (key === "del") {
      targetItem.splice(index, 1)
      objCopy.question.items[parentIndex].mcq_options = targetItem
    }
    setColumns(objCopy)
  }
  const handleCheckEmty = (objCopy) => {
    const areMTMcq = mcqChek(objCopy)
    const areMTRat = starCheck(objCopy)
    const areMTChar = charCheck(objCopy)
    const areQuestionBlank = checkQuestion(objCopy)
    const areTypesSelected = checkTypesSelected(objCopy)
    !areQuestionBlank && !areTypesSelected && !areMTMcq && !areMTRat && !areMTChar
      ? setCanBePublished(true)
      : setCanBePublished(false)
  }
  const handleMCQValue = (index, parentIndex, value) => {
    //Updates the MCQ options for a question
    const objCopy = { ...columns }
    let targetItem = objCopy?.question?.items[parentIndex]?.mcq_options[index]
    let checkArray = objCopy?.question?.items[parentIndex]?.mcq_options.map((item) => item?.value)
    const checkArraySet = new Set(checkArray)
    if (checkArraySet.has(value)) {
      targetItem.value = value
      targetItem.error = true
      targetItem.errorText = "This value already Exist"
      setIsMcqValuePresent(true)
    } else {
      targetItem.value = value
      targetItem.error = false
      targetItem.errorText = ""
      setIsMcqValuePresent(false)
    }
    objCopy.question.items[parentIndex].mcq_options[index] = targetItem
    handleCheckEmty(objCopy)
    setColumns(objCopy)
  }

  // MCQ BLOCK END
  //RATING BLOCK
  const handleStarCount = (parentIndex, count, key) => {
    //Updates the Start Counts for a question
    const objCopy = { ...columns }
    objCopy.question.items[parentIndex][key] = count
    setCanBePublished(false)
    setColumns(objCopy)
    addStarOptions(parentIndex)
  }
  const addStarOptions = (parentIndex) => {
    //Adds inputs based on the Start count selected
    const threeInput = [
      { id: 1, title: "", value: "", error: true, errorText: "Kindly fill this Field" },
      { id: 2, title: "", value: "", error: true, errorText: "Kindly fill this Field" },
      { id: 3, title: "", value: "", error: true, errorText: "Kindly fill this Field" }
    ]
    const addSelector2 = [
      { id: 4, title: "", value: "", error: true, errorText: "Kindly fill this Field" },
      { id: 5, title: "", value: "", error: true, errorText: "Kindly fill this Field" }
    ]
    const fiveInput = [...threeInput, ...addSelector2]
    const addSelector5 = [
      { id: 6, title: "", value: "", error: true, errorText: "Kindly fill this Field" },
      { id: 7, title: "", value: "", error: true, errorText: "Kindly fill this Field" },
      { id: 8, title: "", value: "", error: true, errorText: "Kindly fill this Field" },
      { id: 9, title: "", value: "", error: true, errorText: "Kindly fill this Field" },
      { id: 10, title: "", value: "", error: true, errorText: "Kindly fill this Field" }
    ]
    const tenInput = [...fiveInput, ...addSelector5]
    const objCopy = { ...columns }
    let lengthItem = objCopy?.question?.items[parentIndex]?.starOptions
    let targetItem = objCopy?.question?.items[parentIndex]?.star_options
    switch (lengthItem) {
      case 3:
        if (!targetItem) {
          targetItem = threeInput
        } else {
          targetItem = targetItem.slice(0, 3)
        }
        break
      case 5:
        if (!targetItem) {
          targetItem = fiveInput
        } else {
          if (targetItem?.length === 3) {
            targetItem = [...targetItem, ...addSelector2]
          } else if (targetItem?.length === 10) {
            targetItem = targetItem.slice(0, 5)
          }
        }
        break
      case 10:
        if (!targetItem) {
          targetItem = tenInput
        } else {
          if (targetItem?.length === 3) {
            targetItem = [...targetItem, ...addSelector2, ...addSelector5]
          } else if (targetItem?.length === 5) {
            targetItem = [...targetItem, ...addSelector5]
          }
        }
        break

      default:
        break
    }
    objCopy.question.items[parentIndex]["star_options"] = targetItem
    setColumns(objCopy)
  }

  const hadleStarOption = (index, parentIndex, value) => {
    //Updates the Start options for a question

    const objCopy = { ...columns }
    let targetItem = objCopy?.question?.items[parentIndex]?.star_options[index]
    if (value !== "") {
      let checkArray = objCopy?.question?.items[parentIndex]?.star_options.map(
        (item) => item?.value
      )
      const checkArraySet = new Set(checkArray)
      if (checkArraySet.has(value)) {
        targetItem.value = value
        targetItem.error = true
        targetItem.errorText = "This value already Exist"
        setIsStarValuePresent(true)
      } else {
        targetItem.value = value
        targetItem.error = false
        targetItem.errorText = ""
        setIsStarValuePresent(false)
      }
    } else {
      targetItem.value = value
      targetItem.error = true
      targetItem.errorText = "kindly fill this field"
      setIsStarValuePresent(false)
    }
    objCopy.question.items[parentIndex].star_options[index] = targetItem
    handleCheckEmty(objCopy)
    setColumns(objCopy)
  }

  //Rating BLock ENDS
  const handleCommentValue = (parentIndex, value, key) => {
    //Updates the Max options for a question
    const objCopy = { ...columns }
    if (value !== "0") {
      objCopy.question.items[parentIndex]["comment"][key] = value
      objCopy.question.items[parentIndex]["charError"] = false
      objCopy.question.items[parentIndex]["charErrorText"] = ""
    } else {
      objCopy.question.items[parentIndex]["charError"] = true
      objCopy.question.items[parentIndex]["charErrorText"] = "Max length cannot be 0"
    }
    handleCheckEmty(objCopy)
    setColumns(objCopy)
  }
  const onDragEnd = (result, columns, setColumns) => {
    //=== This Function is used to update the question number
    if (!result.destination) return
    const { source, destination } = result
    const column = columns[source.droppableId]
    const copiedItems = [...column.items]
    const [removed] = copiedItems.splice(source.index, 1)
    copiedItems.splice(destination.index, 0, removed)
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems
      }
    })
    setIsButtonVisible(true)
  }
  const handleErrorData = (title, index, key) => {
    //Displays Error if question name or max Char is not specified

    const objCopy = { ...columns }
    if (key === "title") {
      objCopy.question.items[index]["titleError"] = true
    } else if (key === "max_Char") {
      objCopy.question.items[index]["charError"] = true
    }
    setColumns(objCopy)
  }
  const getErrorObjects = (item, parentIndex) => {
    //Checks Error if question name or max Char is not specified
    let isError = false
    if (!item?.title) {
      isError = true
      handleErrorData(item?.title, parentIndex, "title")
    } else if (item?.max_Char === 0) {
      isError = true
      handleErrorData(item?.title, parentIndex, "max_Char")
    } else {
      isError = false
    }
    return isError
  }
  const createForm = () => {
    //Creates requires Object with keys and value
    const questionsArray = []
    const areOptionAvailable = columns?.question?.items?.length > 0
    let areErrors = false
    areOptionAvailable &&
      columns?.question?.items.forEach((item, parentIndex) => {
        const getErrors = getErrorObjects(item, parentIndex)
        if (!getErrors) {
          areErrors = false
          if (item?.type === "COMMENT") {
            const getCommentObj = createCommentObject(item, parentIndex)
            questionsArray.push(getCommentObj)
          } else if (item?.type === "MULTIPLE_CHOICE") {
            const getMCQobj = createMCQObject(item, parentIndex)
            questionsArray.push(getMCQobj)
          } else if (item?.type === "RATING") {
            const getRATObj = createRATObject(item, parentIndex)
            questionsArray.push(getRATObj)
          }
        } else {
          areErrors = true
        }
      })
    !areErrors && questionsArray?.length > 0 && setPayloadArray(questionsArray)
    isEdit ? setPopUp("edit") : setPopUp("create")
    dispatch(coreAppActions.updatePopupModal(true))
  }
  const getForm = async (id) => {
    setLoading(true)
    const response = await FeedBackService.getFormsDetails(id)
    if (response?.success && response?.code === 200) {
      const sortedQuestions = sortQuestions(response?.data?.form?.questions)
      let columnsFromBackend = {
        question: {
          items: sortedQuestions
        }
      }
      setColumns(columnsFromBackend)
      setFormName(response?.data?.form?.name)
      setNameLength(response?.data?.form?.name?.length)
      setCanBePublished(true)
      setLoading(false)
    } else {
      Toast.showErrorToast(response?.message)
      setLoading(false)
    }
  }
  const postForm = async () => {
    //API hit
    const payload = {}
    payload.form_name = formName
    payload.questions = payloadArray
    const response = formID
      ? await FeedBackService.updateForm(payload, formID)
      : await FeedBackService.createForm(payload)
    if (response.success) {
      Toast.showInfoToast(`${response?.message}`)
      navigate(`/${user.role}/feedback/published-forms`)
      dispatch(coreAppActions.updatePopupModal(false))
    } else {
      Toast.showErrorToast(`${response?.message}`)
      dispatch(coreAppActions.updatePopupModal(false))
    }
  }
  const goBack = () => {
    navigate(`/${user.role}/feedback/published-forms`)
  }
  let popupMap = {
    create: (
      <PopUpChild
        heading={`Publish Feedback Form `}
        subHeading={`Are you sure you want to publish this form ?`}
        handleClose={handleClose}
        src={RemoveForm}
        handleClick={postForm}
      />
    ),
    edit: (
      <PopUpChild
        heading={`Update Feedback Form `}
        subHeading={`Are you sure you want to update this form ?`}
        handleClose={handleClose}
        src={RemoveForm}
        handleClick={postForm}
      />
    )
  }
  const getAddButton = (columnId) => {
    return (
      !isViewOnly && (
        <div style={styles?.generaalPadding}>
          <PrimaryButton
            disabled={!formName}
            onClick={onAddDel.bind(null, columnId, null, "add")}
            style={isMobile ? { ...styles?.button, width: "100%" } : styles?.button}>
            + Add Question
          </PrimaryButton>
        </div>
      )
    )
  }
  const enableAll = () => {
    dispatch(feedBackActions.setIsViewOnly(false))
    dispatch(feedBackActions.setIsEdit(true))
    setIsPreview(true)
  }
  const handleCancel = () => {
    if (isEdit && isPreview) {
      getForm(formID)
      dispatch(feedBackActions.setIsViewOnly(true))
      dispatch(feedBackActions.setIsEdit(false))
    } else if (isEdit) {
      navigateInEdit()
    } else {
      navigateInEdit()
    }
  }
  const navigateInEdit = () => {
    goBack()
    dispatch(feedBackActions.setIsViewOnly(false))
    dispatch(feedBackActions.setIsEdit(false))
  }
  const getButtonStyles = () => {
    return !isMobile
      ? { ...styles?.marginLeft }
      : !canBePublished
      ? { width: "96vw" }
      : { ...styles?.marginLeft, ...styles?.fullWidth }
  }
  const getButtons = () => {
    return (
      <Grid
        item
        xs={!isMobile ? 6 : 12}
        style={
          !isMobile
            ? { ...styles?.display, ...styles?.alignCenter, ...styles?.justifyEnd }
            : {
                ...styles?.display,
                ...styles?.alignCenter,
                width: "88vw",
                ...styles?.justifyCenter
              }
        }>
        {canBePublished && (
          <div onClick={handlePreview} style={{ ...styles?.display, ...styles?.alignCenter }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className="filtericonBox"
              sx={[styles?.smallMarginLeft]}>
              <VisibilityIcon color="primary" sx={{ height: "2rem", width: "2rem" }} />
            </IconButton>
            <Typography sx={[styles?.previewText, styles?.smallMarginLeft]}> Preview</Typography>
          </div>
        )}

        {!isEdit && !isViewOnly && (
          <PrimaryButton
            disabled={!canBePublished || !formName || isMcqValuePresent || isStarValuePresent}
            // style={{ width: "100%" }}
            style={getButtonStyles()}
            onClick={createForm}>
            {" "}
            Publish Feedback Form
          </PrimaryButton>
        )}
        {(isEdit || isViewOnly) && (
          <>
            <SecondaryButton
              style={{ ...styles?.btn, ...styles?.marginLeft }}
              onClick={handleCancel}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              style={{ ...styles?.btn, ...styles?.marginLeft }}
              onClick={isViewOnly ? enableAll : createForm}
              disabled={
                !canBePublished ||
                !formName ||
                isMcqValuePresent ||
                isStarValuePresent ||
                user.role === "subadmin"
                  ? !subAdminPermission?.updatePermission
                  : false
              }>
              {isViewOnly ? "Edit" : "Update"}
            </PrimaryButton>
          </>
        )}
      </Grid>
    )
  }
  const getExpandButton = (item, parentIndex) => {
    return (
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        className="filtericonBox"
        style={styles?.iconButton}
        onClick={handleQuestion.bind(null, parentIndex, !item?.isExpanded, "isExpanded")}>
        {item?.isExpanded ? (
          <KeyboardArrowUpIcon color="primary" fontSize="large" />
        ) : (
          <KeyboardArrowDownIcon color="primary" fontSize="large" />
        )}
      </IconButton>
    )
  }
  const getDelButton = (columnId, parentIndex) => {
    return (
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        className="filtericonBox"
        style={styles?.iconButton}
        onClick={onAddDel.bind(null, columnId, parentIndex, "del")}>
        <img src={Delete} style={{ width: "inherit" }} alt="del" />
      </IconButton>
    )
  }
  return (
    <>
      {!preview ? (
        <Paper
          style={{ padding: "1.6rem", maxWidth: "93vw", marginBottom: isMobile ? "9rem" : "1rem" }}>
          {loading && <AppLoader />}
          <Grid container>
            <Grid
              item
              xs={isMobile ? 12 : 6}
              sx={[styles?.marginBottom, styles?.display, styles?.alignCenter]}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                className="filtericonBox"
                style={styles?.smallMarginLeft}
                onClick={goBack}>
                <ArrowBackIcon color="primary" />
              </IconButton>
              {!isEdit && !isViewOnly && (
                <Typography sx={styles?.pageTitle}>Create a new feedback form</Typography>
              )}
              {(isEdit || isViewOnly) && (
                <Typography sx={styles?.pageTitle}>{formDetails?.formName}</Typography>
              )}
            </Grid>
            {!isMobile && getButtons()}
          </Grid>
          <div style={styles?.generaalPadding}>
            <Box>
              <InputField
                value={formName}
                onChange={({ target: { value } }) => handleFormName(value)}
                style={{ ...styles?.fullWidth }}
                label={"Feedback Form Name"}
                variant="filled"
                InputProps={{ disableUnderline: true }}
                inputProps={{ maxLength: maxLength }}
                maxLength={maxLength}
                disabled={isViewOnly}
                error={formError}
                helperText={<ErrorText text={formErrorText} />}
              />
            </Box>
            <Box sx={[styles?.display, styles?.justifySpace]}>
              <Typography style={styles?.countText}>Max-Count:{maxLength}</Typography>
              <Typography style={styles?.countText}>{`${nameLength}/${maxLength}`}</Typography>
            </Box>

            <DragDropContext
              onDragStart={() => setIsButtonVisible(false)}
              onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
              {Object.entries(columns).map(([columnId, questions]) => {
                return (
                  <div key={columnId}>
                    <Droppable
                      key={columnId}
                      droppableId={columnId}
                      style={styles?.backgroundColor}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={styles?.backgroundColor}>
                          {questions?.items.map((item, parentIndex) => (
                            <div key={parentIndex}>
                              <Divider />

                              <Draggable key={item.id} draggableId={item.id} index={parentIndex}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps}>
                                    <div style={{ ...styles?.smallPadding, ...styles?.fullWidth }}>
                                      <div
                                        style={{
                                          ...styles?.display,
                                          ...styles?.alignCenter
                                        }}>
                                        <div
                                          style={{
                                            ...styles?.display,
                                            ...styles?.alignCenter,
                                            ...styles?.fullWidth
                                          }}>
                                          <div style={{ pointerEvents: isViewOnly && "none" }}>
                                            <IconButton
                                              color="inherit"
                                              aria-label="open drawer"
                                              edge="start"
                                              className="filtericonBox"
                                              style={styles?.iconButton}
                                              {...provided.dragHandleProps}>
                                              <OpenWithIcon color="primary" fontSize="large" />
                                            </IconButton>
                                          </div>
                                          {!isMobile && (
                                            <div style={{ pointerEvents: isViewOnly && "none" }}>
                                              {getDelButton(columnId, parentIndex)}
                                            </div>
                                          )}

                                          <InputField
                                            value={item?.title}
                                            onChange={({ target: { value } }) =>
                                              handleQuestion(parentIndex, value, "title")
                                            }
                                            style={styles?.fullWidth}
                                            InputProps={{
                                              style: { fontSize: "1.6rem" },
                                              disableUnderline: true,
                                              startAdornment: (
                                                <Typography
                                                  style={styles?.marginRight}
                                                  sx={{ fontSize: "1.6rem" }}>{`Q${
                                                  parentIndex + 1
                                                }`}</Typography>
                                              )
                                            }}
                                            inputProps={{ maxLength: 150 }}
                                            error={Boolean(item.titleError)}
                                            helperText={<ErrorText text={item?.titleErrorText} />}
                                            disabled={isViewOnly}
                                          />
                                        </div>

                                        <div>
                                          {!isMobile &&
                                            item?.type &&
                                            getExpandButton(item, parentIndex)}
                                        </div>
                                      </div>
                                      <div>
                                        <div
                                          style={{
                                            pointerEvents: isViewOnly && "none",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginTop: "1rem"
                                          }}>
                                          <CustomSwitch
                                            label="Mark as Optional"
                                            value={item?.isOptional}
                                            handleChange={({ target: { checked } }) =>
                                              handleQuestion(parentIndex, checked, "isOptional")
                                            }
                                          />
                                          {isMobile && (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                justifyContent: "space-around"
                                              }}>
                                              {getDelButton(columnId, parentIndex)}
                                              {item?.type && getExpandButton(item, parentIndex)}
                                            </Box>
                                          )}{" "}
                                        </div>
                                        {item?.isExpanded && (
                                          <div className="secondary-details">
                                            {item?.type === "COMMENT" && (
                                              <CommentInput
                                                item={item}
                                                parentIndex={parentIndex}
                                                handleCommentValue={handleCommentValue}
                                                isViewOnly={isViewOnly}
                                              />
                                            )}
                                            {item?.type === "MULTIPLE_CHOICE" && (
                                              <McqSelector
                                                item={item}
                                                parentIndex={parentIndex}
                                                handleMCQValue={handleMCQValue}
                                                handleMcqOption={handleMcqOption}
                                                isViewOnly={isViewOnly}
                                              />
                                            )}
                                            {item?.type === "RATING" && (
                                              <DropDown
                                                label="Scale"
                                                value={item?.starOptions}
                                                items={[
                                                  { label: 3, value: 3 },
                                                  { label: 5, value: 5 },
                                                  { label: 10, value: 10 }
                                                ]}
                                                style={styles?.dropdownStyle}
                                                handleChange={({ target: { value } }) =>
                                                  handleStarCount(parentIndex, value, "starOptions")
                                                }
                                                showExternal
                                                disabled={isViewOnly}
                                              />
                                            )}
                                            {item?.star_options && (
                                              <StarOptions
                                                item={item}
                                                handleStarOption={hadleStarOption}
                                                parentIndex={parentIndex}
                                                isViewOnly={isViewOnly}
                                              />
                                            )}
                                          </div>
                                        )}

                                        {!item?.type && (
                                          <Formtype
                                            index={parentIndex}
                                            handleChange={handleQuestion}
                                            isMobile={isMobile}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            </div>
                          ))}
                          {isButtonVisible && getAddButton(columnId)}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </DragDropContext>
          </div>
          {isMobile && <CommonFooter> {getButtons()}</CommonFooter>}
        </Paper>
      ) : (
        <PreviewForm items={columns?.question?.items} handleBack={handlePreview} />
      )}
      <PopupModal handleClose={handleClose}>{popupMap[popUp]}</PopupModal>
    </>
  )
}

export default Form
