import { DPostit } from "./DPostit.ts";

export interface DPostitsRef {
  isExist(postitId: string): boolean;
  find(postitId: string): DPostit;
}

