import React, { Suspense, useEffect } from "react"
import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext"
import { PrivateRoutes, PublicRoutes } from "./routes"
import Error404 from "pages/Error404"
import AppLoader from "components/utilities-components/Loader/AppLoader"
import { useIsLoggedIn, userDetail } from "hooks/state"
import PublicWrapper from "../hoc/PublicWrapper"
import AuthWrapper from "../hoc/AuthWrapper"
import { useDispatch } from "react-redux"
import { coreAppActions } from "redux/store"
import IdleTimeout from "components/IdelTimeOut"

const Router = () => {
  const dispatch = useDispatch()
  const isLoggedIn = useIsLoggedIn()
  const user = userDetail()

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(coreAppActions.logout())
    }
  }, [isLoggedIn])

  useEffect(() => {
    dispatch(coreAppActions.updatePopupModal(false))
  }, [])
  return (
    <>
      <AuthContext.Provider value={isLoggedIn}>
        <Suspense fallback={AppLoader} />
        <BrowserRouter>
          {isLoggedIn && <IdleTimeout />}
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace />} />

            {/* All the public routes */}
            {PublicRoutes.map((route) => (
              <Route
                path={route.path}
                key={`Route-${route.path}`}
                element={<PublicWrapper {...route} />}
              />
            ))}

            {/* All the private routes */}

            {user?.role && Array.isArray(user?.role)
              ? user?.role?.map((item) => {
                  return PrivateRoutes[item].map((route) => {
                    return (
                      <Route
                        path={route.path}
                        key={`Route-${route.path}`}
                        element={<AuthWrapper {...route} userDetail={user} />}
                      />
                    )
                  })
                })
              : PrivateRoutes[user?.role].map((route) => (
                  <Route
                    path={route.path}
                    key={`Route-${route.path}`}
                    element={<AuthWrapper {...route} userDetail={user} />}
                  />
                ))}

            {/* 404 page route */}
            <Route exact path="*" element={<Error404 />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </>
  )
}

export default Router
