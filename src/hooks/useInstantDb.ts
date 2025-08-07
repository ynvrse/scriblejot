import { i, init, InstaQLEntity } from '@instantdb/react';

import { env } from '@/lib/env';

const APP_ID = env.instantDbAppId;

const schema = i.schema({
    entities: {
        $files: i.entity({
            path: i.string().unique().indexed(),
            url: i.string(),
        }),
        profiles: i.entity({
            firstName: i.string().optional(),
            lastName: i.string().optional(),
            fullName: i.string().optional(),
            profilePicture: i.string().optional(),
            email: i.string().optional(),
            createdAt: i.date().optional(),
            updatedAt: i.date().optional(),
        }),

        chores: i.entity({
            user_id: i.string().indexed(),
            title: i.string(),
            description: i.string().optional(),
            dueDate: i.date().optional(),
            dueTime: i.date().optional(),
            isCompleted: i.boolean().indexed(),
            isToday: i.boolean().indexed(),
            createdAt: i.date().indexed(),
            icon: i.string(),
        }),

        notes: i.entity({
            title: i.string().indexed(),
            content: i.string(),
            isPublic: i.boolean().optional().indexed(),
            tags: i.json().optional(),
            createdAt: i.date().indexed(),
            updatedAt: i.date().optional(),
        }),

        comments: i.entity({
            content: i.string(),
            createdAt: i.date().indexed(),
            updatedAt: i.date().optional(),
        }),

        quick_lists: i.entity({
            title: i.string(),
            user_id: i.string().indexed(),
            createdAt: i.date().indexed(),
            updatedAt: i.date().optional(),
            isArchived: i.boolean().optional(),
        }),
        quick_list_items: i.entity({
            item: i.string(),
            isCompleted: i.boolean().optional(),
            order: i.number().indexed(),
            createdAt: i.date().indexed(),
            updatedAt: i.date().optional(),
        }),
    },
    links: {
        noteToAuthor: {
            forward: { on: 'notes', has: 'one', label: 'noteAuthor' },
            reverse: { on: 'profiles', has: 'many', label: 'writtenNotes' },
        },

        noteToComments: {
            forward: { on: 'notes', has: 'many', label: 'noteComments' },
            reverse: { on: 'comments', has: 'one', label: 'commentNote' },
        },

        commentToAuthor: {
            forward: { on: 'comments', has: 'one', label: 'commentAuthor' },
            reverse: { on: 'profiles', has: 'many', label: 'writtenComments' },
        },

        quickListToItems: {
            forward: { on: 'quick_lists', has: 'many', label: 'items' },
            reverse: { on: 'quick_list_items', has: 'one', label: 'parentList' },
        },
    },
});

export type Profile = InstaQLEntity<typeof schema, 'profiles'>;
export type Note = InstaQLEntity<typeof schema, 'notes'>;
export type Comment = InstaQLEntity<typeof schema, 'comments'>;
export type Chore = InstaQLEntity<typeof schema, 'chores'>;
export type Quicklist = InstaQLEntity<typeof schema, 'quick_lists'>;
export type QuicklistItem = InstaQLEntity<typeof schema, 'quick_list_items'>;

const db = init({ appId: APP_ID, schema });
const room = db.room('todos');

export { db, room };
