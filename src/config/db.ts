import { openDB } from 'idb';

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    unitStock: string;
}

export const initDB = async () => {
    return openDB('stellaryst_db', 11, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
            }

            if (!db.objectStoreNames.contains('stellaryst')) {
                const appConfigs = db.createObjectStore('stellaryst', { keyPath: 'id', autoIncrement: true });

                appConfigs.add({
                    appName: 'ScribleJot',
                    owner: 'ynvrse',
                    name: 'Dion Firmansyah',
                    gitHub: 'https://github.com/ynvrse',
                    sourceCode: 'https://github.com/ynvrse/stellaryst',
                    createdAt: new Date(),
                    updatedAt: null,
                });
            }
        },
    });
};
