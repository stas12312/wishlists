export interface ParseResult {
  title: string;
  cost: number;
  image: string;
}

export interface ParseStatus {
  result: ParseResult;
  status: "FINISHED" | "ERROR" | "WAITING" | "RUNNING";
}

export interface ParseStartInfo {
  status: string;
  task_id: string;
}
