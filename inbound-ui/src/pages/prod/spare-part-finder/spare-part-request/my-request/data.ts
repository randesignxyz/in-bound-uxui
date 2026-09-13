import { List } from "lodash";

export type SparePartRequestListItem = {
  id: number;
  requestId: string;
  productId: List<string>;
  
}