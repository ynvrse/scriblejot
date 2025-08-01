import { i, init, InstaQLEntity } from '@instantdb/react';

import { env } from '@/lib/env';

const APP_ID = env.instantDbAppId;

const schema = i.schema({
    entities: {
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
        shoping_lists: i.entity({
            item: i.string(),
            user_id: i.string().indexed(),
            isCompleted: i.boolean(),
            createdAt: i.date().indexed(),
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
    },
});

export type Profile = InstaQLEntity<typeof schema, 'profiles'>;
export type Note = InstaQLEntity<typeof schema, 'notes'>;
export type Comment = InstaQLEntity<typeof schema, 'comments'>;
export type Chore = InstaQLEntity<typeof schema, 'chores'>;
export type ShopingList = InstaQLEntity<typeof schema, 'shoping_lists'>;

const db = init({ appId: APP_ID, schema });
const room = db.room('todos');

export { db, room };
