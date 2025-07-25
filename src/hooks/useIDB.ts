// hooks/useInstantDB.ts
import { init } from '@instantdb/react';
import schema from '../../instant.schema';
const APP_ID = 'b31ef944-da66-44be-a7dc-f5daae90fa61';
const db = init({ appId: APP_ID, schema });

export default db;
