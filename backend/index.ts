import { Database } from './src/core/database/Database';

const dbInstance = Database.instance;

const test = async () => {
    console.log(await dbInstance.fetchDepartments());
    console.log(await dbInstance.fetchCities('department_id', 1));
}

test();
