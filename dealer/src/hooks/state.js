import { useCookies } from "react-cookie"
import { CookieKeys } from "constants/cookieKeys"
import { useSelector } from "react-redux"
// custom hooks to get state stored in redux
export const useIsLoggedIn = () => {
  const [cookies] = useCookies([CookieKeys.Auth])
  return cookies[CookieKeys.Auth] !== undefined
}

export const userDetail = () => {
  const userDetail = useSelector((state) => state.app.user)
  const detail = useSelector((state) => state.app.detail)

  const user = {
    userId: userDetail?.userId,
    role: getUserRole(userDetail?.role, detail),
    name: userDetail?.username,
    email: userDetail?.email,
    phoneNumber: userDetail?.phone,
    profileImg: userDetail?.profileImg,
    permissions: detail?.permissions,
    parentUserId: userDetail?.parentUserId
  }

  return user
}

function getUserRole(role, detail) {
  switch (role) {
    case "DEALER":
      if (detail?.subRoleId && detail?.parentUserId) {
        return "employee"
      } else {
        return "dealer"
      }
    default:
      return ["dealer", "employee"]
  }
}
