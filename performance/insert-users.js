import { insertTestUsers } from '../playwright/support/database.js';

insertTestUsers()
    .then(() => console.log('Concluído!'))
    .catch(err => console.error(err))
    .finally(() => process.exit());;