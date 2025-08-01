// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react';

const _schema = i.schema({
    entities: {
        $files: i.entity({
            path: i.string().unique().indexed(),
            url: i.string(),
        }),
        $users: i.entity({
            email: i.string().unique().indexed().optional(),
        }),
        chores: i.entity({
            dueDate: i.string().optional(),
            dueTime: i.string().optional(),
            icon: i.string().optional(),
            isCompleted: i.boolean().optional(),
            isToday: i.boolean().optional(),
            title: i.string().optional(),
            user_id: i.string().optional(),
        }),
        comments: i.entity({
            content: i.string(),
            createdAt: i.date().indexed(),
            updatedAt: i.date().optional(),
        }),
        notes: i.entity({
            content: i.string(),
            createdAt: i.date().indexed(),
            isPublic: i.boolean().indexed().optional(),
            tags: i.any().optional(),
            title: i.string().indexed(),
            updatedAt: i.date().optional(),
        }),
        profiles: i.entity({
            createdAt: i.date().optional(),
            email: i.string().optional(),
            firstName: i.string().optional(),
            fullName: i.string().optional(),
            lastName: i.string().optional(),
            profilePicture: i.string().optional(),
            updatedAt: i.date().optional(),
            userId: i.string().optional(),
        }),
        shoping_lists: i.entity({
            createdAt: i.number().optional(),
            isCompleted: i.boolean().optional(),
            item: i.string().optional(),
            user_id: i.string().optional(),
        }),
        todos: i.entity({
            createdAt: i.number().optional(),
            done: i.boolean().optional(),
            text: i.string().optional(),
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
    rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
