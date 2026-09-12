export interface WebhookRequestSummary {
  id: string;
  method: string;
  path: string;
  content_type: string;
  body_size: number;
  received_at: string;
}


export interface RequestBody {
  format:
    | "json"
    | "text"
    | "base64";

  raw: string;
  parsed: unknown;
}


export interface WebhookRequestDetail
  extends WebhookRequestSummary {
  headers: Record<string, string>;

  query_params: Record<
    string,
    string[]
  >;

  body: RequestBody;

  source_ip: string | null;
}


export interface CursorPage<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}