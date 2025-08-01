// Optimized NotesSection with realtime comments and better performance
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db } from '@/hooks/useInstantDb';
import { useUserProfile } from '@/hooks/useUserProfile';

import formatRelativeTime from '@/lib/utils';

import { id, tx } from '@instantdb/react';
import { isValid, parseISO } from 'date-fns';
import * as Icons from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Type declarations
type Comment = {
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

type Note = {
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

// Memoized utility function to format dates
const formatDate = (date: Date) => {
    if (!isValid(date)) return '-';

    return formatRelativeTime(date);
};

// Memoized Empty State Component
const EmptyState = memo(({ onAddNote, disabled }: { onAddNote: () => void; disabled: boolean }) => (
    <div className="flex flex-col items-center justify-center px-8 py-16">
        <div className="relative mb-6">
            <div className="flex items-center justify-center">
                <div className="relative">
                    <div className="h-20 w-16 rotate-3 transform rounded-lg bg-gradient-to-br from-amber-100 to-orange-200 shadow-lg">
                        <div className="absolute top-2 left-1/2 h-0.5 w-8 -translate-x-1/2 transform bg-red-300"></div>
                        <div className="p-3 pt-4">
                            <div className="space-y-2">
                                <div className="h-1 w-8 rounded bg-amber-300/60"></div>
                                <div className="h-1 w-6 rounded bg-amber-300/40"></div>
                                <div className="h-1 w-7 rounded bg-amber-300/50"></div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-2 -right-4 h-20 w-16 -rotate-6 transform rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
                        <div className="absolute top-2 left-1/2 h-0.5 w-8 -translate-x-1/2 transform bg-red-300"></div>
                        <div className="p-3 pt-4">
                            <div className="space-y-2">
                                <div className="h-1 w-7 rounded bg-blue-300/60"></div>
                                <div className="h-1 w-8 rounded bg-blue-300/40"></div>
                                <div className="h-1 w-5 rounded bg-blue-300/50"></div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-1 -left-4 h-20 w-16 rotate-12 transform rounded-lg bg-gradient-to-br from-green-100 to-green-200 shadow-lg">
                        <div className="absolute top-2 left-1/2 h-0.5 w-8 -translate-x-1/2 transform bg-red-300"></div>
                        <div className="p-3 pt-4">
                            <div className="space-y-2">
                                <div className="h-1 w-6 rounded bg-green-300/60"></div>
                                <div className="h-1 w-8 rounded bg-green-300/40"></div>
                                <div className="h-1 w-7 rounded bg-green-300/50"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-sm space-y-3 text-center">
            <h3 className="text-xl font-semibold text-gray-800">Belum Ada Catatan</h3>
            <p className="text-sm leading-relaxed text-gray-500">
                Tulis ide, reminder, atau hal penting lainnya dalam bentuk catatan
            </p>
        </div>

        <Button
            onClick={onAddNote}
            className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-orange-700 hover:shadow-xl"
            size="lg"
            disabled={disabled}
        >
            <Icons.Plus size={18} className="mr-2" />
            Tulis Catatan Pertama
        </Button>
    </div>
));

// Memoized Note Card Component
const NoteCard = memo(({ note, onSelect }: { note: Note; onSelect: (note: Note) => void }) => {
    const { profile: currentProfile } = useUserProfile();
    const handleClick = useCallback(() => {
        onSelect(note);
    }, [note, onSelect]);

    return (
        <Card
            className="relative flex max-w-[250px] min-w-[250px] flex-shrink-0 cursor-pointer items-start gap-3 p-4 transition-shadow duration-200 hover:shadow-md"
            onClick={handleClick}
        >
            {/* Privacy indicator */}
            <div className="absolute top-2 right-2 flex gap-2 text-xs text-gray-500">
                {note.isPublic ? <Icons.Globe size={12} className="text-green-700" /> : <Icons.Lock size={12} />}
                {note.noteComments && note.noteComments.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Icons.MessageSquare size={12} />
                        {note.noteComments.length}
                    </div>
                )}
            </div>

            <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={note.noteAuthor?.[0]?.profilePicture} />
                <AvatarFallback>
                    {note.noteAuthor?.[0]?.fullName?.[0] || note.noteAuthor?.[0]?.firstName?.[0] || 'U'}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 pt-1">
                <div className="mb-2 flex items-center gap-2">
                    <h3 className="truncate font-serif text-sm">
                        {note.noteAuthor?.[0]?.id == currentProfile?.id
                            ? 'Anda'
                            : note.noteAuthor?.[0]?.fullName || note.noteAuthor?.[0]?.firstName || 'Anonymous'}
                    </h3>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="line-clamp-1 font-mono text-xs">{formatDate(note.createdAt)}</span>
                </div>
                {/* {note.title && <h4 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-800">{note.title}</h4>} */}
                <p className="line-clamp-3 text-sm leading-relaxed break-words">{note.content}</p>
            </div>
        </Card>
    );
});

// Memoized Comment Component
const CommentItem = memo(({ comment, currentProfileId }: { comment: Comment; currentProfileId?: string }) => {
    const isOwnComment = comment.commentAuthor?.[0]?.id === currentProfileId;

    return (
        <div className={`flex items-start gap-3 ${!isOwnComment ? '' : 'justify-end'}`}>
            {!isOwnComment && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.commentAuthor?.[0]?.profilePicture} />
                    <AvatarFallback>
                        {comment.commentAuthor?.[0]?.fullName || comment.commentAuthor?.[0]?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
            )}

            <div
                className={`max-w-[75%] min-w-[150px] rounded-lg p-2 text-sm break-words ${
                    isOwnComment ? 'self-end bg-blue-100 text-right' : 'self-start bg-gray-200'
                } `}
            >
                <p className="font-serif text-black">
                    {isOwnComment
                        ? 'Anda'
                        : comment.commentAuthor?.[0]?.fullName || comment.commentAuthor?.[0]?.firstName || 'Anonymous'}
                </p>

                <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>

                <p className="mt-2 text-left leading-relaxed break-words whitespace-pre-wrap text-gray-800">
                    {comment.content}
                </p>
            </div>

            {isOwnComment && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.commentAuthor?.[0]?.profilePicture} />
                    <AvatarFallback>
                        <Icons.User />
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
});

export default function NotesSection() {
    const { user, profile: currentProfile } = useUserProfile();
    const [showAddNote, setShowAddNote] = useState(false);
    const [editingMode, setEditingMode] = useState(false);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [editingNote, setEditingNote] = useState<any>(null);
    const [newNote, setNewNote] = useState({ title: '', content: '', isPublic: false });
    const [newComment, setNewComment] = useState('');

    const lastCommentRef = useRef<HTMLDivElement | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        const parsed = notes.map((note) => ({
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
        if (selectedNote && commentsQuery.data?.comments) {
            const updatedNote = {
                ...selectedNote,
                noteComments: commentsQuery.data.comments.map((comment) => ({
                    ...comment,
                    createdAt: typeof comment.createdAt === 'string' ? parseISO(comment.createdAt) : comment.createdAt,
                    updatedAt: typeof comment.updatedAt === 'string' ? parseISO(comment.updatedAt) : comment.updatedAt,
                })),
            };
            setSelectedNote(updatedNote);
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
        async (e: React.FormEvent) => {
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

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-center py-16">
                    <Icons.Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-center py-16">
                    <p className="text-red-500">Error loading notes: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <Icons.StickyNote size={18} />
                    <h2 className="text-lg font-semibold">Notes</h2>
                </div>
                <Button onClick={handleToggleAddNote} size="sm" variant="outline" disabled={!user}>
                    <Icons.Plus size={16} className="mr-1" />
                    Add Note
                </Button>
            </div>

            {showAddNote && (
                <div className="bg-background fixed inset-0 z-50 flex items-end justify-center px-4 sm:items-center">
                    <div className="w-full max-w-md rounded-t-2xl p-4 shadow-lg sm:rounded-2xl sm:pt-6 sm:pb-6">
                        <div className="mb-4 text-center">
                            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-gray-300 sm:hidden" />
                            <h2 className="text-lg font-semibold">Buat Catatan</h2>
                            <p className="text-sm text-gray-500">Tulis catatan pribadi atau publik.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Catatan</label>
                                <textarea
                                    ref={textareaRef}
                                    autoFocus
                                    placeholder="Tulis catatan Anda di sini..."
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    className="min-h-[100px] w-full resize-none rounded-lg border p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    rows={4}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewNote({ ...newNote, isPublic: !newNote.isPublic });
                                        // jangan blur agar keyboard tidak turun
                                        textareaRef.current?.focus();
                                    }}
                                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        newNote.isPublic
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {newNote.isPublic ? <Icons.Globe size={16} /> : <Icons.Lock size={16} />}
                                    {newNote.isPublic ? 'Publik' : 'Privat'}
                                </button>
                                <span className="text-xs text-gray-500">
                                    {newNote.isPublic ? 'Semua orang bisa melihat' : 'Hanya Anda yang bisa melihat'}
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    onClick={() => {
                                        addNote();
                                        textareaRef.current?.blur(); // bisa tetap aktif jika kamu mau keyboard tetap terbuka
                                    }}
                                    size="sm"
                                    disabled={!(newNote.content ?? '').trim()}
                                >
                                    <Icons.Check size={16} className="mr-1" />
                                    Simpan
                                </Button>
                                <Button
                                    onClick={() => {
                                        textareaRef.current?.blur(); // supaya keyboard turun
                                        setShowAddNote(false);
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    Batal
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show empty state when no notes */}
            {filteredNotes.length === 0 ? (
                <EmptyState onAddNote={handleShowAddNote} disabled={!user} />
            ) : (
                <div className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4">
                    {filteredNotes.map((note: any) => (
                        <NoteCard key={note.id} note={note} onSelect={handleNoteSelect} />
                    ))}
                </div>
            )}

            {/* Mobile-Optimized Modal Detail */}
            {selectedNote && (
                <div
                    ref={modalRef}
                    className="modal-content fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:bg-black/50 sm:p-4"
                >
                    {/* Mobile-first Card - Full height on mobile */}
                    <Card className="scrollbar-hide flex h-full w-full flex-col overflow-hidden border-0 shadow-none sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-lg sm:border sm:shadow-lg">
                        {/* Fixed Header - always visible */}
                        <div className="flex shrink-0 items-center justify-between border-b p-4 sm:p-6">
                            <h3 className="text-lg font-semibold">Detail Catatan</h3>
                            <Button variant="ghost" size="icon" onClick={handleCloseModal} className="h-8 w-8">
                                <Icons.X size={18} />
                            </Button>
                        </div>
                        <div className="p-4 sm:p-6">
                            {editingNote ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Catatan</label>
                                        <textarea
                                            value={editingNote.content}
                                            onChange={(e) =>
                                                setEditingNote({ ...editingNote, content: e.target.value })
                                            }
                                            className="min-h-[120px] w-full resize-none rounded-lg border p-3 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            rows={5}
                                        />
                                    </div>

                                    {/* Mobile-optimized toggle */}
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingNote({
                                                    ...editingNote,
                                                    isPublic: !editingNote.isPublic,
                                                })
                                            }
                                            className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors ${
                                                editingNote.isPublic
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {editingNote.isPublic ? (
                                                <Icons.Globe size={18} />
                                            ) : (
                                                <Icons.Lock size={18} />
                                            )}
                                            <span className="font-medium">
                                                {editingNote.isPublic ? 'Publik' : 'Privat'}
                                            </span>
                                        </button>
                                        <p className="text-center text-xs text-gray-500">
                                            {editingNote.isPublic
                                                ? 'Semua orang bisa melihat'
                                                : 'Hanya Anda yang bisa melihat'}
                                        </p>
                                    </div>

                                    {/* Mobile-optimized buttons */}
                                    <div className="flex gap-2">
                                        <Button onClick={updateNote} className="flex-1 py-3">
                                            <Icons.Check size={16} className="mr-2" />
                                            Update
                                        </Button>
                                        <Button
                                            onClick={() => setEditingNote(null)}
                                            variant="outline"
                                            className="flex-1 py-3"
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Author info - mobile optimized */}
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-12 w-12 shrink-0">
                                            <AvatarImage src={selectedNote.noteAuthor?.[0]?.profilePicture} />
                                            <AvatarFallback>
                                                {selectedNote.noteAuthor?.[0]?.fullName?.[0] ||
                                                    selectedNote.noteAuthor?.[0]?.firstName?.[0] ||
                                                    'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate font-medium">
                                                {selectedNote.noteAuthor?.[0]?.fullName ||
                                                    selectedNote.noteAuthor?.[0]?.firstName ||
                                                    'Anonymous'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(selectedNote.createdAt)}
                                            </p>
                                        </div>
                                        {/* Privacy badge - moved below on mobile */}
                                        <div className="mt-1">
                                            {selectedNote.isPublic ? (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">
                                                    <Icons.Globe size={12} />
                                                    <span>Publik</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-500">
                                                    <Icons.Lock size={12} />
                                                    <span>Privat</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Menu button */}
                                        {selectedNote.noteAuthor?.[0]?.id === currentProfile?.id && (
                                            <Button
                                                variant={'ghost'}
                                                size={'icon'}
                                                onClick={() => setEditingMode(!editingMode)}
                                                className="h-8 w-8 shrink-0 items-center"
                                            >
                                                <Icons.Ellipsis size={16} />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Note content */}
                                    <div className="rounded-lg bg-green-50 p-4">
                                        <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                                            {selectedNote.content}
                                        </p>
                                    </div>

                                    {/* Action buttons - mobile optimized */}
                                    {editingMode && selectedNote.noteAuthor?.[0]?.id === currentProfile?.id && (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => setEditingNote({ ...selectedNote })}
                                                variant="outline"
                                                className="flex-1 py-3"
                                            >
                                                <Icons.Edit3 size={16} className="mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => deleteNote(selectedNote.id)}
                                                variant="outline"
                                                className="flex-1 py-3 text-red-600 hover:text-red-700"
                                            >
                                                <Icons.Trash2 size={16} className="mr-2" />
                                                Hapus
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <h4 className="mt-4 flex items-center gap-2 text-base font-semibold">
                                <Icons.MessageSquare size={16} />
                                Komentar
                                {selectedNote.noteComments && selectedNote.noteComments.length > 0 && (
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        {selectedNote.noteComments.length}
                                    </span>
                                )}
                            </h4>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 sm:p-6">
                                {/* Comments Section */}
                                <div className="mt-6 flex flex-col gap-3">
                                    {/* Comments list - mobile optimized */}
                                    <div className="space-y-3">
                                        {selectedNote.noteComments?.map((comment: Comment, index: number) => {
                                            const isLast = index === selectedNote.noteComments.length - 1;
                                            return (
                                                <div key={comment.id} ref={isLast ? lastCommentRef : null}>
                                                    <CommentItem
                                                        comment={comment}
                                                        currentProfileId={currentProfile?.id}
                                                    />
                                                </div>
                                            );
                                        })}
                                        {(!selectedNote.noteComments || selectedNote.noteComments.length === 0) && (
                                            <div className="rounded-lg bg-gray-50 p-4 text-center">
                                                <Icons.MessageSquare size={24} className="mx-auto mb-2 text-gray-400" />
                                                <p className="text-sm text-gray-500">Belum ada komentar</p>
                                                <p className="text-xs text-gray-400">
                                                    Jadilah yang pertama berkomentar!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Comment Form - positioned above keyboard on mobile */}
                        {user && (
                            <div className="shrink-0 border-t p-4 pb-2 sm:pb-4">
                                <div className="flex items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                        <form onSubmit={addComment} autoComplete="off">
                                            <div className="flex items-center gap-2">
                                                <textarea
                                                    name="comment_xyz123"
                                                    autoComplete="new-password"
                                                    autoCapitalize="off"
                                                    autoCorrect="off"
                                                    spellCheck={false}
                                                    value={newComment}
                                                    onChange={(e) => {
                                                        setNewComment(e.target.value);

                                                        // Auto-grow tinggi textarea
                                                        e.target.style.height = 'auto'; // reset dulu
                                                        e.target.style.height = `${e.target.scrollHeight}px`; // lalu atur tinggi sesuai isi
                                                    }}
                                                    placeholder="Tulis komentar..."
                                                    className="flex-1 resize-none overflow-hidden rounded-lg border p-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    style={{
                                                        minHeight: '44px', // tinggi awal minimum
                                                        maxHeight: '120px', // batasi maksimum jika perlu
                                                    }}
                                                    rows={1}
                                                />

                                                <Button
                                                    size="sm"
                                                    type="submit"
                                                    disabled={!newComment?.trim()}
                                                    className="h-11 w-11 rounded-full"
                                                >
                                                    <Icons.Send size={24} className="h-25" />
                                                </Button>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-400"></p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
