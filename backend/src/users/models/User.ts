interface User {
  id: number;
  first_name: string;
  middle_name?: string;
  first_last_name: string;
  second_last_name?: string;
  document_id_number: string;
  doc_id_type_id: number;
  username: string;
  password: string;
  role_id: number;
  active: boolean;
  updated_at: string;
  created_at: string;
}

type UserCreate = Omit<User, 'active' | 'created_at' | 'updated_at'>;
type UserLogin = Pick<User, 'username' | 'password'>;

export type { User, UserCreate, UserLogin };
