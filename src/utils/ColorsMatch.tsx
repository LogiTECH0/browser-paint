import type { RGBA } from "../types/Types";
export function colorsMatch(c1: RGBA, c2: RGBA) { 
  return c1[0] === c2[0] &&
         c1[1] === c2[1] &&
         c1[2] === c2[2] &&
         c1[3] === c2[3];
}