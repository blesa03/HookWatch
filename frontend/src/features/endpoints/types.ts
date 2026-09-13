export interface Endpoint {
  id: string;
  name: string;
  status:
    | "active"
    | "disabled"
    | "expired";
  state:
    | "active"
    | "disabled";
  is_temporary: boolean;
  ingest_url: string;
  request_count: number;
  last_request_at: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface RequestFilters {
  search: string;
  method: string;
}