import type { CategoryDto } from '../category/data';
import { IngredientDto } from '../ingredient/data';
import type { PricingDto } from '../pricing/data';
import type { VatDto } from '../vat/data';

// export interface TableViewSearchParams<T> {
//   criteria?: { searchValue?: string; advanceSearch?: T; sort?: Record<string, SortOrder> };
//   pagination?: {
//     pageSize?: number;
//     current?: number;
//   };
// }

export type ProductAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
};

export type ProductCreate = {
  id?: string;
  name: string;
  nameEn: string;
  code: string;
  shortName?: string;
  description?: string;
  descriptionEn?: string;
  barCode?: string;
  vatId?: string;
  categoryId?: string;
  // pricing: number;
  ingredients?: string[];
};

export type ProductDto = {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  barCode?: string;
  shortName?: string;
  description?: string;
  descriptionEn?: string;
  status: string;
  vat?: VatDto;
  category?: CategoryDto;
  pricing?: PricingDto;
  ingredients?: IngredientDto[];
  sequence: number;
};
