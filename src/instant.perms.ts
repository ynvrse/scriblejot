// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react';

const rules = {
    $files: {
        allow: {
            view: 'true',
            create: 'true',
            delete: 'true',
        },
    },
} satisfies InstantRules;

export default rules;
