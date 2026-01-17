const API_BASE = "http://localhost:8000";

export interface ProcessRequest {
  expression: string;
  input_format: "1" | "2" | "3"; // 1 = Infix, 2 = Prefix, 3 = Postfix
}

export interface ProcessResponse {
  infix?: string;
  prefix?: string;
  postfix?: string;
  answer?: number;
  error?: string;
}

export async function processExpression(request: ProcessRequest): Promise<ProcessResponse> {
  try {
    const response = await fetch(`${API_BASE}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || "Failed to process expression");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Cannot connect to server. Please ensure the backend is running on localhost:8000");
    }
    throw error;
  }
}
