export interface ParseResult {
  title: string;
  cost: number;
  image: string;
  currency: string;
}

export interface ParseStatus {
  result: ParseResult;
  status: "FINISHED" | "FAILED" | "WAITING" | "RUNNING";
}

export interface ParseStartInfo {
  status: string;
  task_id: string;
}

export interface ParseError {
  detail: string;
}

export interface ShopParam {
  url: string;
  name: string;
}
