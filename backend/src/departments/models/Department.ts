export interface Department {
    id: number;
    department_name: string;
    department_code: string;
    active: boolean;
}

export type DepartmentCreate = Pick<Department, 'department_name' | 'department_code'>
