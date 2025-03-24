import { Database } from './src/core/database/Database';
import { type Department } from './src/departments/models/Department';

const dbInstance = Database.instance;

const test = async () => {
    console.log(await dbInstance.select<Department[]>(
        'departments', 
        ['id', 'department_name', 'department_code', 'active']
    ));
}

test();
