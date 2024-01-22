export type IngredientDto = {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  status: string;
  key?: string;
};

export type IngredientCreate = {
  id?: string;
  name: string;
  nameEn: string;
};

export type IngredientAdvanceSearchParams = {
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
};
