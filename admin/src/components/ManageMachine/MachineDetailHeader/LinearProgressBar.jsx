import React from "react"
import styles from "./MachineDetailHeader.module.scss"

const LinearProgressBar = ({ value, max }) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={styles.linear_progress_bar}>
      <div
        className={`${styles.linear_progress_bar__fill} ${
          value === 100 ? styles.fill_green : value >= 90 ? styles.fill_yellow : styles.fill_red
        }
        
        `}
        style={{ width: `${percentage}%` }}>
        <div className={styles.no_text}>{percentage}%</div>
        <div className={styles.p1_text}>
          {percentage === 100 ? "Systems Operational" : "System Error"}
        </div>
      </div>
    </div>
  )
}

export default LinearProgressBar
