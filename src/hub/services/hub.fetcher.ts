// src/hub/services/hub.fetcher.ts

export class HubAPIError extends Error {
  constructor(
    public status: number,
    public url: string,
    public body: string
  ) {
    super(`API ${status} at ${url}: ${body}`);
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function hubFetch<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  parseJson = true
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
        continue;
      }

      if (!res.ok) {
        throw new HubAPIError(res.status, url, await res.text());
      }

      if (!parseJson) {
        return (await res.text()) as any as T;
      }

      try {
        return await res.json() as T;
      } catch (jsonErr) {
        console.error(`hubFetch: Failed to parse JSON from ${url}`, jsonErr);
        throw jsonErr;
      }
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await sleep(500 * (attempt + 1));
    }
  }
  throw new Error(`hubFetch failed after ${retries} attempts: ${url}`);
}
