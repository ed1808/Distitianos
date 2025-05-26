export interface City {
  id: number;
  city_name: string;
  city_code: string;
  department_id: number;
  active: boolean;
}

export type CityCreate = Pick<
  City,
  'city_name' | 'city_code' | 'department_id'
>;

export type CityUpdate = Partial<Pick<City, 'city_name' | 'city_code'>>;
