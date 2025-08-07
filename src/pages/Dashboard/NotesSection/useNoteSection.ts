// D:\Project\PWA\perbaikian\src\pages\Dashboard\NotesSection\useNoteSection.ts
import { db, Profile } from '@/hooks/useInstantDb';
import { useUserProfile } from '@/hooks/useUserProfile';
import { id, tx } from '@instantdb/react';
import { parseISO } from 'date-fns';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Type declarations
export type Comment = {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
    commentAuthor: {
        id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        profilePicture?: string;
        email?: string;
    }[];
};

export type Note = {
    id: string;
    title: string;
    content: string;
    isPublic?: boolean;
    tags?: any;
    createdAt: Date;
    updatedAt?: Date;
    noteAuthor: {
        id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        profilePicture?: string;
        email?: string;
    }[];
    noteComments: Comment[];
};

export const useNoteSection = () => {
    const { user, profile: currentProfile } = useUserProfile();
    const [showAddNote, setShowAddNote] = useState(false);
    const [editingMode, setEditingMode] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [newNote, setNewNote] = useState({ title: '', content: '', isPublic: false });
    const [newComment, setNewComment] = useState('');

    const lastCommentRef = useRef<HTMLDivElement | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (showAddNote) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [showAddNote]);

    // Main query for notes - automatically updates in realtime
    const query = db.useQuery({
        notes: {
            noteAuthor: {},
            noteComments: {
                commentAuthor: {},
            },
        },
        $files: {},
    });

    // Separate query for realtime comments when a note is selected
    const commentsQuery = db.useQuery(
        selectedNote
            ? {
                  comments: {
                      $: {
                          where: {
                              commentNote: selectedNote.id,
                          },
                      },
                      commentAuthor: {},
                  },
              }
            : null,
    );

    const { data, isLoading, error } = query;
    const notes = data?.notes || [];

    // Memoize parsed notes to avoid unnecessary recalculations
    const parsedNotes = useMemo(() => {
        const parsed = (notes as unknown as Note[]).map((note) => ({
            ...note,
            createdAt: typeof note.createdAt === 'string' ? parseISO(note.createdAt) : note.createdAt,
            updatedAt: typeof note.updatedAt === 'string' ? parseISO(note.updatedAt) : note.updatedAt,
            noteComments: note.noteComments.map((comment) => ({
                ...comment,
                createdAt: typeof comment.createdAt === 'string' ? parseISO(comment.createdAt) : comment.createdAt,
                updatedAt: typeof comment.updatedAt === 'string' ? parseISO(comment.updatedAt) : comment.updatedAt,
            })),
        }));

        // Urutkan berdasarkan createdAt terbaru
        return parsed.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Descending: terbaru duluan
        });
    }, [notes]);

    // Memoize filtered notes
    const filteredNotes = useMemo(() => {
        return parsedNotes.filter((note) => {
            const author = Array.isArray(note.noteAuthor) ? note.noteAuthor[0] : note.noteAuthor;

            return note.isPublic || author?.id === currentProfile?.id;
        });
    }, [parsedNotes, currentProfile?.id]);

    // Update selected note with realtime comments
    useEffect(() => {
        if (commentsQuery.data?.comments) {
            setSelectedNote((currentSelectedNote) => {
                if (!currentSelectedNote) return null;
                const updatedComments = commentsQuery.data.comments.map((comment: any) => ({
                    ...comment,
                    createdAt: typeof comment.createdAt === 'string' ? parseISO(comment.createdAt) : comment.createdAt,
                    updatedAt: typeof comment.updatedAt === 'string' ? parseISO(comment.updatedAt) : comment.updatedAt,
                }));

                return {
                    ...currentSelectedNote,
                    noteComments: updatedComments,
                };
            });
        }
    }, [commentsQuery.data?.comments]);

    const addNote = useCallback(async () => {
        if (!(newNote.content ?? '').trim() || !user || !currentProfile) return;

        try {
            const noteId = id();
            await db.transact([
                tx.notes[noteId].update({
                    title: newNote.title || 'Untitled',
                    content: newNote.content,
                    isPublic: newNote.isPublic,
                    createdAt: new Date(),
                }),
                tx.notes[noteId].link({ noteAuthor: currentProfile.id }),
            ]);

            setNewNote({ title: '', content: '', isPublic: false });
            setShowAddNote(false);
        } catch (err) {
            console.error('Error adding note:', err);
        }
    }, [newNote, user, currentProfile]);

    const updateNote = useCallback(async () => {
        if (!editingNote || !(editingNote.content ?? '').trim()) return;

        try {
            await db.transact([
                tx.notes[editingNote.id].update({
                    title: editingNote.title,
                    content: editingNote.content,
                    isPublic: editingNote.isPublic,
                    updatedAt: new Date(),
                }),
            ]);

            setEditingNote(null);
            setSelectedNote(null);
            setEditingMode(false);
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }, [editingNote]);

    const deleteNote = useCallback(
        async (noteId: string) => {
            try {
                const noteToDelete = parsedNotes.find((n) => n.id === noteId);
                if (noteToDelete?.noteComments) {
                    const deleteCommentsTx = noteToDelete.noteComments.map((comment) =>
                        tx.comments[comment.id].delete(),
                    );
                    await db.transact([...deleteCommentsTx, tx.notes[noteId].delete()]);
                } else {
                    await db.transact([tx.notes[noteId].delete()]);
                }

                setSelectedNote(null);
                setEditingMode(false);
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        },
        [parsedNotes],
    );

    const addComment = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            if (!selectedNote || !(newComment ?? '').trim() || !user || !currentProfile) return;

            try {
                const commentId = id();
                await db.transact([
                    tx.comments[commentId].update({
                        content: newComment,
                        createdAt: new Date(),
                    }),
                    tx.comments[commentId].link({ commentNote: selectedNote.id }),
                    tx.comments[commentId].link({ commentAuthor: currentProfile.id }),
                ]);

                setNewComment('');
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        },
        [selectedNote, newComment, user, currentProfile],
    );
    useEffect(() => {
        if (lastCommentRef.current) {
            lastCommentRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedNote?.noteComments?.length]);

    useEffect(() => {
        if (lastCommentRef.current) {
            // Delay 50ms untuk memastikan rendering selesai
            const timeout = setTimeout(() => {
                lastCommentRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [commentsQuery.data?.comments]);

    // Memoized callbacks for event handlers
    const handleNoteSelect = useCallback((note: Note) => {
        setSelectedNote(note);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedNote(null);
        setEditingNote(null);
        setEditingMode(false);
    }, []);

    const handleShowAddNote = useCallback(() => {
        setShowAddNote(true);
    }, []);

    const handleToggleAddNote = useCallback(() => {
        setShowAddNote(!showAddNote);
    }, [showAddNote]);

    const getProfilePictureUrl = (profile: Profile) => {
        const picture = profile?.profilePicture;

        if (!picture) return null;

        if (picture.startsWith('https://lh3.googleusercontent.com')) {
            // Jika profilePicture adalah URL dari Google
            return picture;
        }

        const foundFile = data?.$files?.find((file: any) => file.path === picture);
        return foundFile?.url || null;
    };

    return {
        // Data
        notes: filteredNotes,
        isLoading,
        error,
        currentProfile,
        user,

        // State
        showAddNote,
        editingMode,
        selectedNote,
        editingNote,
        newNote,
        newComment,

        // Refs
        textareaRef,
        lastCommentRef,
        modalRef,

        // Functions
        setShowAddNote,
        setEditingMode,
        setSelectedNote,
        setEditingNote,
        setNewNote,
        setNewComment,
        handleNoteSelect,
        handleCloseModal,
        handleShowAddNote,
        handleToggleAddNote,
        addNote,
        updateNote,
        deleteNote,
        addComment,
        getProfilePictureUrl,
    };
};
