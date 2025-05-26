export interface Category {
  id: number;
  category_name: string;
  active: boolean;
  created_at: string;
}

type CategoryPayload = Pick<Category, 'category_name'>;

export type CategoryCreate = CategoryPayload;
export type CategoryUpdate = CategoryPayload;
