import React, { useState } from "react"
import GoogleMapReact from "google-map-react"
import MapMarker from "assets/images/icons/googleMarker.svg"
import { Box, Grid, Typography } from "@mui/material"
import { userDetail } from "hooks/state"
import { useNavigate } from "react-router-dom"

const GMap = ({ data }) => {
  const user = userDetail()
  const navigate = useNavigate()

  const markers = data
    ?.filter((item) => item?.outlet?.latitude != null && item?.outlet?.longitude != null)
    .reduce((acc, item) => {
      const existingMarker = acc.find(
        (marker) => marker.lat === item.outlet.latitude && marker.lng === item.outlet.longitude
      )
      if (existingMarker) {
        existingMarker.data.push(item)
      } else {
        acc.push({
          lat: item.outlet.latitude,
          lng: item.outlet.longitude,
          data: [item]
        })
      }
      return acc
    }, [])

  const renderMarkers = () => {
    return markers.map((marker, index) => (
      <FixedMarker key={index} lat={marker.lat} lng={marker.lng} data={marker.data} />
    ))
  }

  const FixedMarker = ({ data }) => {
    const [showInfo, setShowInfo] = useState(false)

    return (
      <Grid
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(-50%, -100%)`,
          cursor: "pointer"
        }}>
        <Marker />
        {showInfo && (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              top: "100%",
              left: "50%",
              width: "180px",
              transform: "translateX(-50%)",
              background: "white",
              padding: "8px",
              borderRadius: "5px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
              gap: "4px",
              maxHeight: "140px",
              overflow: "scroll"
            }}>
            {data.map((item, index) => (
              <Grid
                onClick={() => {
                  if (user?.role === "admin" || user?.role === "subadmin") {
                    navigate(`/${user.role}/manage-machines/details/${data[index]?.machineGuid}`)
                  }
                }}
                sx={{ marginBottom: "2rem" }}
                key={index}>
                <Typography color="#1F59AF" variant="p3">
                  {item.name}
                </Typography>
                <Box style={{ display: "block", margin: "0.5rem 0rem" }}>
                  <Typography color="text.main" variant="p5">
                    {item.outlet.dealer.username}
                  </Typography>
                </Box>
                <Typography color="#8692A4" variant="p5">
                  {item.outlet.address}
                </Typography>
              </Grid>
            ))}
          </Box>
        )}
      </Grid>
    )
  }

  const Marker = () => {
    return <img src={MapMarker} alt="Marker" />
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_API_KEY }}
        defaultCenter={{ lat: 28.7041, lng: 77.1025 }}
        defaultZoom={8}>
        {renderMarkers()}
      </GoogleMapReact>
    </div>
  )
}

export default GMap
