import { promisify } from "node:util";
const sleep = promisify(setTimeout);

export const getFileSize = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return (
      Number.parseInt(response.headers.get("content-length") ?? "0") ||
      undefined
    );
  } catch (error) {
    await sleep(1000);
    console.error(`Failed to get file size for ${url}: ${error}`);
    return undefined;
  }
};
