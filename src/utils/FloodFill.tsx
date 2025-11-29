import type { Flood } from "../types/Types";
import { colorsMatch } from "./ColorsMatch";

export function floodFill({ imageData, x, y, targetColor, fillColor }: Flood) {
  const { data, width, height } = imageData;
  const stack: [number, number][] = [[x, y]];

  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    const pos = (cy * width + cx) * 4;

    if (!colorsMatch([data[pos], data[pos + 1], data[pos + 2], data[pos + 3]] as [number, number, number, number], targetColor)) continue;

    data[pos] = fillColor[0];
    data[pos + 1] = fillColor[1];
    data[pos + 2] = fillColor[2];
    data[pos + 3] = fillColor[3];

    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < width - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < height - 1) stack.push([cx, cy + 1]);
  }
}
