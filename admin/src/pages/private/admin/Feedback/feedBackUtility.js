import moment from "moment"
import { dateMonthFormat } from "helpers/app-dates/dates"

export const newQuestion = (id) => {
  //====Function that return a new Question when user clicks on Add
  return {
    title: "",
    isOptional: false,
    type: "",
    id: `${id}`,
    mcq_options: [],
    starOptions: null,
    start_options: [],
    comment: { maxChar: "" },
    isExpanded: true
  }
}
export const newMcqOptions = (id) => {
  return { id, value: "", error: false, errorText: "" }
}
export const maxLength = 25

export const createCommentObject = (item, index) => {
  return item?.questionId
    ? {
        questionId: item.questionId,
        question_type: item?.type,
        is_optional: item?.isOptional,
        question_name: item?.title,
        description: "",
        char_limit: JSON.parse(item?.comment?.maxChar),
        options: [],
        order: index + 1
      }
    : {
        question_type: item?.type,
        is_optional: item?.isOptional,
        question_name: item?.title,
        description: "",
        char_limit: JSON.parse(item?.comment?.maxChar),
        options: [],
        order: index + 1
      }
}

export const createMCQObject = (item, index) => {
  return item?.questionId
    ? {
        questionId: item.questionId,
        question_type: item?.type,
        is_optional: item?.isOptional,
        question_name: item?.title,
        description: "",
        options: getOptions(item?.mcq_options),
        order: index + 1
      }
    : {
        question_type: item?.type,
        is_optional: item?.isOptional,
        question_name: item?.title,
        description: "",
        options: getOptions(item?.mcq_options),
        order: index + 1
      }
}
export const createRATObject = (item, index) => {
  return item?.questionId
    ? {
        questionId: item.questionId,
        question_type: item?.type,
        is_optional: item?.isOptional,
        question_name: item?.title,
        description: "",
        options: getOptions(item?.star_options),
        order: index + 1
      }
    : {
        question_type: item?.type,
        is_optional: item?.isOptional,
        question_name: item?.title,
        description: "",
        options: getOptions(item?.star_options),
        order: index + 1
      }
}

const getOptions = (item) => {
  let datas = item.map((data, index) => {
    return data?.questionOptionId
      ? {
          order: index + 1,
          option_text: data.value,
          QuestionOptionId: data?.questionOptionId
        }
      : {
          order: index + 1,
          option_text: data.value
        }
  })
  return datas
}
export const sortData = (labelKey, key, data) => {
  const sortedData = data?.map(({ [labelKey]: label, [key]: value, ...rest }) => ({
    label,
    value,
    ...rest
  }))
  return sortedData
}
export const sortPublishedForms = (item) => {
  let datas = item.map((data, index) => {
    return {
      serial: index + 1,
      formName: data?.name,
      formId: data?.formId,
      createdAt: moment(data?.createdAt).format("DD/MM/YYYY"),
      questions: data?.questions?.length
    }
  })
  return datas
}
export const createData = (checkbox, sku, type, status, washTime, hsrp, name, mobile, action) => {
  return {
    checkbox,
    sku,
    status,
    type,
    washTime,
    hsrp,
    name,
    mobile,
    action
  }
}

export const sortMappedForms = (data) => {
  const sortedData = data.map((item, index) => {
    return {
      serial: index + 1,
      formName: item?.name,
      questions: item?.questions?.length,
      createdAt: moment(item?.createdAt).format("DD/MM/YYYY"),
      responses: item?.responsesReceived,
      region: item?.region,
      state: item?.state,
      city: item?.city,
      oem: item?.oem,
      dealer: getDealerNames(item?.dealers),
      machines: item?.machine?.length > 0 ? item?.machine.map((machines) => machines?.name) : [],
      formId: item?.formId
    }
  })
  return sortedData
}
export const sortQuestions = (recievedQuestions) => {
  let arrangedQuestion = []
  recievedQuestions.forEach((question, index) => {
    const convertedQuestion = convertQuestion(question, index)
    arrangedQuestion.push(convertedQuestion)
  })
  return arrangedQuestion
}

const convertQuestion = (question, index) => {
  return {
    title: question?.name,
    isOptional: question?.isOptional,
    type: question?.questionType,
    questionId: question?.questionId,
    id: `${index + 1}`,
    mcq_options:
      question.questionType === "MULTIPLE_CHOICE" ? convertMCQ(question?.questionOption) : [],
    star_options: question.questionType === "RATING" ? convertRating(question?.questionOption) : [],
    starOptions: question.questionType === "RATING" ? question?.questionOption?.length : "",
    comment: { maxChar: question?.commentQuestionMaxChar ?? "" },
    isExpanded: index === 0 ? true : false
  }
}

const convertMCQ = (mcqArray) => {
  return mcqArray.map((item, index) => {
    return {
      id: index + 1,
      value: item?.text,
      questionId: item.questionId,
      questionOptionId: item?.QuestionOptionId
    }
  })
}
const convertRating = (ratingArray) => {
  return ratingArray.map((item, index) => {
    return {
      id: index + 1,
      value: item?.text,
      questionId: item.questionId,
      questionOptionId: item?.QuestionOptionId
    }
  })
}

export function createPublishedData(serial, formName, questions, createdOn, action) {
  return { serial, formName, questions, createdOn, action }
}

export const parseData = {
  MULTIPLE_CHOICE: (data) => {
    let count = data?.questionOption?.map((x) => x?.answerCount).reduce((x, y) => x + y)
    let temp = {
      questionId: data?.questionId,
      questionTitle: `${data?.name}${data?.isOptional ? "*" : ""}`,
      isOptional: data?.isOptional,
      questionType: data.questionType,
      analyticsData: {
        labels: data?.questionOption?.map((x) => x?.text),
        dataArray: data?.questionOption?.map((x) => x?.answerCount).map((x) => (x * 100) / count)
      },
      responseCount: count
    }

    return temp
  },
  COMMENT: (data) => {
    let temp = {
      questionId: data?.questionId,
      questionTitle: "Feedbacks",
      questionType: data.questionType,
      isOptional: data?.isOptional,
      responseCount: data?.questionResponse ? data?.questionResponse.length : 0,
      analyticsData: data?.questionResponse?.map((x) => {
        return {
          customer_name: x?.transactionFeedback?.name,
          response: x?.question_response
        }
      })
    }

    return temp
  }
}

export const sortOutletData = (responseData, selectedDealers, agents) => {
  //eslint-disable-next-line no-unused-vars
  const sortedData = responseData.map((item) => {
    return {
      ...item,
      totalAgentsCount: getTotalAgentsCount(item?.machines),
      dealerName: getDealerName(item?.dealerId, selectedDealers),
      machines: getMachines(item?.machines, agents)
    }
  })
  return sortedData
}

export const getTotalAgentsCount = (machines) => {
  const agentsInMachines = machines.map((machine) => machine?.agents)
  const flatArray = agentsInMachines.flat()
  return flatArray?.length
}

const getDealerName = (id, dealerArray) => {
  return dealerArray.find((dealer) => dealer?.value === id)?.label
}

const getMachines = (machines, agents) => {
  return machines.map((machine) => {
    return { ...machine, agents: getAgents(machine?.agents, agents) }
  })
}
const getAgents = (recievedAgents, agents) => {
  const x = recievedAgents.map((recievedAgent) => {
    const agentsArray = agents?.find((agent) => agent?.value == recievedAgent?.agentId)
    return agentsArray
  })
  return x
}

const getDealerNames = (dealers) => {
  return dealers?.length !== 0 ? dealers.map((dealer) => dealer?.dealer?.username) : []
}
export const getDealers = (responseDealers, allDealers) => {
  const selectedDealers = responseDealers.map((recievedAgent) => {
    const agentsArray = allDealers?.find((dealer) => dealer?.value == recievedAgent?.dealerId)
    return agentsArray
  })
  return selectedDealers
}
export const sortAbandonedListing = (responseData) => {
  return responseData.map((data) => {
    return {
      feedBackId: data?.transactionFeedbackId,
      transactionId: data?.transactionGuid,
      formId: data?.formId,
      type: data?.transactions?.washType?.Name,
      sku: data?.skuNumber,
      status: data?.notifiedAt
        ? `Sent On ${dateMonthFormat(data?.notifiedAt, "DD/MM/YYYY")}`
        : "Abandoned",
      washTime: moment(data?.washTime).format("MMM DD YYYY"),
      hsrp: data?.hsrpNumber,
      name: data?.name,
      mobile: data?.phone,
      emailId: data?.emailId,
      bike: data?.bikeModel,
      manufacturer: data?.manufacturer,
      transactionFeedbackId: data?.transactionFeedbackId
    }
  })
}

export const getNames = (data) => {
  if (data?.length == 0) {
    return "NA"
  } else {
    return data.length === 1
      ? data[0]
      : data?.length === 2
      ? `${data[0]} , ${data[1]}`
      : `${data[0]} , ${data[1]} + ${data?.length - 2}more `
  }
}

export const apiParams = (
  startDate,
  endDate,
  regionIds,
  stateIds,
  cityIds,
  oemIds,
  dealerIds,
  machineIds,
  sort,
  searchQuery
) => {
  const regionIdString = regionIds.join(",")
  const stateIdString = stateIds.join(",")
  const cityIdString = cityIds.join(",")
  const oemIdString = oemIds.join(",")
  const dealerIdString = dealerIds.join(",")
  const machineIdString = machineIds.join(",")
  const fromDate = startDate ? moment(startDate?.toString()).format("YYYY-MM-DD") : ""
  const toDate = endDate ? moment(endDate?.toString()).format("YYYY-MM-DD") : ""

  return [
    `?sort=${sort}&cityIds=${cityIdString}&regionIds=${regionIdString}&oemIds=${oemIdString}&machineIds=${machineIdString}&dealerIds=${dealerIdString}&stateIds=${stateIdString}&toDate=${toDate}&fromDate=${fromDate}&search=${searchQuery}`
  ]
}

export const mcqChek = (objCopy) => {
  const filterCharactersItems = objCopy.question.items.filter(
    (item) => item?.type === "MULTIPLE_CHOICE"
  )
  if (filterCharactersItems?.length > 0) {
    const mcqArrayMap = filterCharactersItems.map((item) => item?.mcq_options)
    const flattenedArrayMap = mcqArrayMap.flat()
    const hasEmtyMcq = flattenedArrayMap.map((item) => item?.value === "")
    return hasEmtyMcq?.includes(true)
  } else {
    return false
  }
  // hasEmtyMcq?.includes(true) ? setCanBePublished(false) : setCanBePublished(true)
}
export const starCheck = (objCopy) => {
  const filterStarItems = objCopy.question.items.filter((item) => item?.type === "RATING")
  if (filterStarItems?.length > 0) {
    const starArrayMap = filterStarItems.map((item) => item?.star_options)
    const flattenedArrayMap = starArrayMap.flat()
    const hasEmtyStar = flattenedArrayMap.map((item) => item?.value === "")
    return hasEmtyStar?.includes(true)
  } else {
    return false
  }
  // hasEmtyStar?.includes(true) ? setCanBePublished(false) : setCanBePublished(true)
}

export const charCheck = (objCopy) => {
  const filterCharactersItems = objCopy.question.items.filter((item) => item?.type === "COMMENT")
  if (filterCharactersItems?.length > 0) {
    const charArrayMap = filterCharactersItems.map((item) => item?.comment)
    const hasEmtyChar = charArrayMap.map((item) => item?.maxChar === "")
    return hasEmtyChar.includes(true)
  } else {
    return false
  }
}
export const checkQuestion = (objCopy) => {
  const quesArrayMap = objCopy.question.items.map((item) => item?.title)
  return quesArrayMap.includes("")
}
export const checkTypesSelected = (objCopy) => {
  const titleArrayMap = objCopy.question.items.map((item) => item?.type)
  return titleArrayMap.includes("")
}
