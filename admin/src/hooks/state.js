import { useCookies } from "react-cookie"
import { CookieKeys } from "constants/cookieKeys"
import { useSelector } from "react-redux"
// import { decodeToken } from 'react-jwt';
// custom hooks to get state stored in redux
export const useIsLoggedIn = () => {
  const [cookies] = useCookies([CookieKeys.Auth])
  return cookies[CookieKeys.Auth] !== undefined
}

export const userDetail = () => {
  const userDetail = useSelector((state) => state.app.user)
  const user = {
    userId: userDetail?.userId,
    role: getUserRole(userDetail?.role, userDetail),
    name: userDetail?.username,
    email: userDetail?.email,
    phoneNumber: userDetail?.phone,
    profileImg: userDetail?.profileImg,
    permissions: userDetail?.permissions,
    cityId: userDetail?.userArea?.cityId,
    oemId: userDetail?.oemId
  }
  return user
}

function getUserRole(role, userDetail) {
  switch (role) {
    case "ADMIN":
      if (role === "ADMIN" && userDetail?.subRoleId && userDetail?.parentUserId) {
        return "subadmin"
      } else {
        return "admin"
      }
    case "SUBADMIN":
      return "subadmin"
    case "FEEDBACK_AGENT":
      return "agent"
    case "AREA_MANAGER":
      return "areaManager"
    case "OEM":
      return "oemManager"
    default:
      return ["admin", "subadmin", "agent", "areaManager", "oemManager"]
  }
}
