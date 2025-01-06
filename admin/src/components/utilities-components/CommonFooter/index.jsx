// INFO : This footer will render for smaller screen sizes (sm-breakpoint or 600 px max-width )
import React from "react"
import styles from "./commonFooter.module.scss"

const CommonFooter = ({ children }) => {
  return <div className={styles.container}>{children}</div>
}

export default CommonFooter
