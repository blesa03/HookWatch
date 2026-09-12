export interface RequestSummaryEvent {
  id: string;
  method: string;
  path: string;
  content_type: string;
  body_size: number;
  received_at: string;
}


export type RealtimeEvent =
  | {
      type: "webhook.received";
      request: RequestSummaryEvent;
    }
  | {
      type: "request.deleted";
      request_id: string;
    }
  | {
      type: "requests.cleared";
      deleted_count: number;
    }
  | {
      type: "endpoint.closed";
      endpoint_id: string;
    };