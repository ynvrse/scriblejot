import { i } from '@instantdb/react';

const _schema = i.schema({
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

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
