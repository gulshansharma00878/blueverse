import { useState, useEffect } from "react"
import { CmsService } from "network/cmsService"

export const useRegionList = () => {
  const [data, setData] = useState([])
  useEffect(() => {
    async function fetchData() {
      let regionData = await CmsService.getRegionList()
      if (regionData.code === 200 && regionData.success) {
        setData(regionData?.data)
      } else {
        setData([])
      }
    }
    fetchData()
  }, [])
  return { data }
}
