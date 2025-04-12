export interface Category {
  id: number;
  category_name: string;
  active: boolean;
  created_at: string;
}

export type CategoryCreate = Pick<Category, 'category_name'>;
