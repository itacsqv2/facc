let cached: boolean | undefined;

/** True when the browser can create a WebGL context (required by MapLibre). Cached per page. */
export function detectWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}
