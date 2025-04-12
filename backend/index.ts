import { Database } from './src/core/database/Database';
import { type Department } from './src/departments/models/Department';
import type { CategoryCreate, Category } from './src/categories/models/Category';

const dbInstance = Database.instance;

const test = async () => {
    /* console.log(await dbInstance.select<Department[]>(
        'departments', 
        ['id', 'department_name', 'department_code', 'active']
    )); */
    /* const testCategory: CategoryCreate = {category_name: "Test"};
    console.log(await dbInstance.insert<Category[]>('categories', testCategory)); */
    // await dbInstance.delete('categories', {"id": 1});
}

test();
