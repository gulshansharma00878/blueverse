// INFO : Utility functions will be kept here that will help to download data of the app for the users to their local machines.
import exportFromJSON from "export-from-json"

export const downloadData = ({ data, fileName, fileType = "csv" }) => {
  // NOTE : Accepted File Types : 'txt'(default), 'css', 'html', 'json', 'csv', 'xls', 'xml'
  const excelFile = exportFromJSON({ data: data, fileName: fileName, exportType: fileType })

  return excelFile
}
