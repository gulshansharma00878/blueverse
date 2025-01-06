import moment from "moment"

export function createSubAdminData(id, name, type, mailId, number, isActive, addedOn, action) {
  return { id, name, type: type.role, mailId, number, isActive, addedOn, action }
}

export const sortResponseData = (receivedData) => {
  const sortedData = receivedData.map((subAdmin) => {
    return {
      id: subAdmin?.userId, //changeIttoUniqueId
      uniqueId: subAdmin?.uniqueId, //changeIttoUniqueId
      name: subAdmin?.username,
      type: { role: subAdmin?.subRole?.name, id: subAdmin?.subRole?.subRoleId },
      mailId: subAdmin?.email,
      number: subAdmin?.phone,
      isActive: subAdmin?.isActive,
      addedOn: moment(subAdmin?.createdAt).format("DD/MM/YY")
    }
  })
  return sortedData
}
export const sortSubAdminData = (receivedData) => {
  return {
    id: receivedData?.userId,
    name: receivedData?.username,
    email: receivedData?.email,
    contact: receivedData?.phone,
    status: receivedData?.isActive ? "Active" : "Inactive",
    role: receivedData?.subRole?.name ?? "Role Deactivated",
    createdAt: moment(receivedData?.createdAt).format("DD/MM/YY")
  }
}
export const sortEditSubAdminData = (receivedData) => {
  return {
    name: receivedData?.username,
    email: receivedData?.email,
    contact: receivedData?.phone,
    status: receivedData?.isActive ? "Active" : "Inactive",
    role: receivedData?.subRole?.subRoleId ?? ""
  }
}
export const getPayLoad = (values) => {
  return values?.contact
    ? {
        username: values.name,
        email: values.email,
        phone: values.contact,
        isActive: values.status === "Active" ? true : false,
        subRoleId: values?.role
      }
    : {
        username: values.name,
        email: values.email,
        isActive: values.status === "Active" ? true : false,
        subRoleId: values?.role
      }
}
