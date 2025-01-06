// Define the type for the query body used to list additional services
export type serviceListQueryBody = {
  limit: number; // Number of results to return (pagination)
  offset: number; // Number of results to skip (pagination)
  search?: string; // Optional search term to filter results
  sortBy: string; // Field to sort the results by
  orderBy: string; // Order of sorting (e.g., 'asc' or 'desc')
  isFourWheeler?: boolean;
  isTwoWheeler?: boolean;
};

// Define the type for the body used to update additional service details
export type updateAdditionalServiceBody = {
  name?: string; // Optional new name for the additional service
  isActive?: boolean; // Optional active status for the additional service
  isTwoWheeler?: boolean;
  isFourWheeler?: boolean;
};
