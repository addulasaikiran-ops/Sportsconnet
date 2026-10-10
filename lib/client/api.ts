export class ClientApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ClientApiError";
  }
}

/** JSON fetch helper for the app's own API routes. Throws a readable error. */
export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(path, {
      ...rest,
      headers: json === undefined ? headers : { "Content-Type": "application/json", ...headers },
      body: json === undefined ? rest.body : JSON.stringify(json)
    });
  } catch {
    throw new ClientApiError("You appear to be offline. Check your connection and try again.", 0);
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof result?.error === "string" ? result.error : "Something went wrong. Please try again.";
    throw new ClientApiError(response.status === 401 ? "Please sign in to continue." : message, response.status);
  }
  return result as T;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
