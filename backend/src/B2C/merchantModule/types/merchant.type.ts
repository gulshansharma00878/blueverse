export interface AddMerchantBody {
  bannerImageUrl?: string;
  outletName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  operationStartTime?: string;
  operationEndTime?: string;
  runningStartTime?: string;
  runningEndTime?: string;
}

export interface AddPricingTermBody {
  washTypeId?: string;
  merchantId?: string;
  washPrice?: number;
  manPowerPrice?: number;
  cgstPercentage?: number;
  sgstPercentage?: number;
  totalPrice?: number;
  grossAmount?: number;
  servicesOffered?: any; // Assuming this is a complex type, you can replace `any` with a more specific type if needed
}

export interface AdditionalServiceBody {
  additionalServiceId?: string;
  price?: number;
  grossAmount?: number;
  cgstPercentage?: number;
  sgstPercentage?: number;
  merchantId?: string; // This will be added in the method
}

export type merchantListQueryBody = {
  limit: number; // Number of results to return (pagination)
  offset: number; // Number of results to skip (pagination)
  search?: string; // Optional search term to filter results
  sortBy: string; // Field to sort the results by
  orderBy: string; // Order of sorting (e.g., 'asc' or 'desc')
};
