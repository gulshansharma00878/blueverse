export const columns = [
  {
    id: "srNo",
    label: "Sr No."
  },
  {
    id: "item",
    label: "Item"
  },
  {
    id: "washes",
    label: "Total Washes"
  },
  {
    id: "perWash",
    label: "Per Wash Rate (INR)"
  },
  {
    id: "manPower",
    label: "Manpower Rate (INR)"
  },
  {
    id: "baseAmount",
    label: "Base Amount (INR)"
  },
  {
    id: "cgst",
    label: "CGST (INR) 9%"
  },
  {
    id: "sgst",
    label: "SGST (INR) 9%"
  },
  {
    id: "total",
    label: "Total (INR)"
  }
]
export function createData(srNo, item, washes, perWash, manPower, baseAmount, cgst, sgst, total) {
  return {
    srNo,
    item,
    washes,
    perWash,
    manPower,
    baseAmount,
    cgst,
    sgst,
    total
  }
}
export const createBVCredits = (srNo, item, washes, total) => {
  return { srNo, item, washes, total }
}
export const topUpColumns = [
  {
    id: "srNo",
    label: "Sr No."
  },
  {
    id: "item",
    label: "Item"
  },
  {
    id: "baseAmount",
    label: "Base Amount (INR)"
  },
  {
    id: "cgst",
    label: "CGST (INR) 9%"
  },
  {
    id: "sgst",
    label: "SGST (INR) 9%"
  },
  {
    id: "total",
    label: "Total (INR)"
  }
]
export const creditsColumns = [
  {
    id: "srNo",
    label: "Sr No."
  },
  {
    id: "item",
    label: "Item"
  },
  {
    id: "washes",
    label: "Total Washes"
  },
  {
    id: "total",
    label: "Total (INR)"
  }
]
export function createTopUpData(srNo, item, baseAmount, cgst, sgst, total) {
  return {
    srNo,
    item,
    baseAmount,
    cgst,
    sgst,
    total
  }
}

export const detailsColumn = [
  {
    id: "hsnNo",
    label: "HSN/SAC"
  },
  {
    id: "total",
    label: "Taxable Value (INR)"
  },
  {
    id: "cgst",
    label: "CGST (INR) 9%"
  },
  {
    id: "sgst",
    label: "SGST (INR) 9%"
  },
  {
    id: "totalTax",
    label: "Total Tax Paid"
  }
]
export const createInvoiceData = (srNo, item, hsnNo, washes, sellingPrice, total) => {
  return { srNo, item, hsnNo, washes, sellingPrice, total }
}
export const taxInvoiceColumns = [
  {
    id: "srNo",
    label: "Sr No.",
    width: 100
  },
  {
    id: "item",
    label: "Item"
  },
  {
    id: "hsnNo",
    label: "HSN/SAC"
  },
  {
    id: "washes",
    label: "Total Washes"
  },
  {
    id: "sellingPrice",
    label: "Selling Price (INR)"
  },
  {
    id: "total",
    label: "Total (INR)"
  }
]
