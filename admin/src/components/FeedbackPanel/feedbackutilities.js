import { dateMonthFormat } from "helpers/app-dates/dates"

export const region = [
  { value: 1, label: "North" },
  { value: 2, label: "South" },
  { value: 3, label: "East" },
  { value: 4, label: "West" }
]
export const dealer = [
  { value: 1, label: "D1" },
  { value: 2, label: "D2" },
  { value: 3, label: "D3" },
  { value: 4, label: "D5" },
  { value: 4, label: "D6" },
  { value: 4, label: "D7" },
  { value: 4, label: "D8" }
]
export const oem = [
  { value: 1, label: "O1" },
  { value: 2, label: "O2" },
  { value: 3, label: "O3" },
  { value: 4, label: "O4" }
]
export const machine = [
  { value: 1, label: "M1" },
  { value: 2, label: "M2" },
  { value: 3, label: "M3" },
  { value: 4, label: "M4" }
]
export const city = [
  { value: 1, label: "City1" },
  { value: 2, label: "City2" },
  { value: 3, label: "City3" },
  { value: 4, label: "City4" }
]
export const getMachinesAgents = (data) => {
  const machineMap = new Map()
  const dataMap = data.map((outlets) => outlets.machines)
  const flatArray = dataMap.flat()
  flatArray.map((machine) => {
    if (machineMap.has(machine?.machineGuid)) {
      machineMap.set(machine?.machineGuid, [
        ...machineMap.get(machine?.machineGuid),
        ...getAgentsinMachine(machine?.agents, machine.machineGuid)
      ])
    } else {
      machineMap.set(machine?.machineGuid, [
        ...getAgentsinMachine(machine?.agents, machine.machineGuid)
      ])
    }
  })
  const requiredArray = []
  const apiEntries = [...machineMap.entries()]
  apiEntries.forEach((entry) => {
    requiredArray.push(...entry[1])
  })
  return requiredArray
}

const getAgentsinMachine = (agents, machineGuid) => {
  return agents.map((agent) => {
    return {
      agentId: agent.value,
      machineId: machineGuid
    }
  })
}

export const parseQuestionData = (rawData) => {
  let parsed = rawData.map((x) => {
    let temp = {
      customerName: x?.transactionFeedback?.name,
      washTime: dateMonthFormat(x?.transactionFeedback?.washTime, "DD/MM/YYYY hh:mm A"),
      washType: x?.transactionFeedback?.transactions?.washType?.Name,
      response: x?.question_response
    }

    return temp
  })

  return parsed
}
