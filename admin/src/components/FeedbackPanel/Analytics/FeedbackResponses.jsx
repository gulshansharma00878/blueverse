// This component will render feedback text responses list.

import React from "react"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import Divider from "@mui/material/Divider"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"

const ResponseItem = ({ name, response }) => {
  return (
    <React.Fragment>
      <ListItem alignItems="flex-start" sx={{ padding: "0px" }}>
        <ListItemText
          primary={
            <Typography color="text.main" variant="p2">
              {name}
            </Typography>
          }
          secondary={
            <Typography component="p" variant="p3" color="text.gray">
              {response}
            </Typography>
          }
        />
      </ListItem>
      <Divider component="li" />
    </React.Fragment>
  )
}
const FeedbackResponses = ({ data }) => {
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {data.map((x, index) => (
        <div key={index}>
          <ResponseItem name={x.customer_name} response={x.response} key={index} />
        </div>
      ))}
    </List>
  )
}

export default FeedbackResponses
