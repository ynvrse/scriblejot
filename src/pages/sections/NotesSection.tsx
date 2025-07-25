// Optimized NotesSection with realtime comments and better performance
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import db from '@/hooks/useIDB';
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
    createdAt: Date | string;
    updatedAt?: Date | string;
    commentAuthor: {
        id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        profilePicture?: string;
        email?: string;
    };
};

type Note = {
    id: string;
    title: string;
    content: string;
    isPublic?: boolean;
    tags?: any;
    createdAt: Date | string;
    updatedAt?: Date | string;
    noteAuthor: Array<{
        id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        profilePicture?: string;
        email?: string;
    }>;
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
            className="relative flex max-w-[300px] min-w-[280px] flex-shrink-0 cursor-pointer items-start gap-3 p-4 transition-shadow duration-200 hover:shadow-md"
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
                <AvatarImage src={note.noteAuthor?.[0]?.profilePicture || 'https://github.com/shadcn.png'} />
                <AvatarFallback>
                    {note.noteAuthor?.[0]?.fullName?.[0] || note.noteAuthor?.[0]?.firstName?.[0] || 'U'}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 pt-1">
                <div className="mb-2 flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium text-gray-900">
                        {note.noteAuthor?.[0]?.id == currentProfile?.id
                            ? 'Anda'
                            : note.noteAuthor?.[0]?.fullName || note.noteAuthor?.[0]?.firstName || 'Anonymous'}
                    </h3>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs whitespace-nowrap text-gray-400">{formatDate(note.createdAt)}</span>
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
                    <AvatarImage src={comment.commentAuthor?.[0]?.profilePicture || 'https://github.com/shadcn.png'} />
                    <AvatarFallback>
                        {comment.commentAuthor?.[0]?.fullName || comment.commentAuthor?.[0]?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
            )}

            <div
                className={`max-w-[75%] min-w-[150px] rounded-lg p-2 text-sm break-words ${
                    isOwnComment ? 'self-end bg-blue-100 text-right' : 'self-start bg-gray-100'
                }`}
            >
                <p className="font-medium">
                    {comment.commentAuthor?.[0]?.fullName || comment.commentAuthor?.[0]?.firstName || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                <p className="mt-1">{comment.content}</p>
            </div>

            {isOwnComment && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.commentAuthor?.[0]?.profilePicture} />
                    <AvatarFallback>
                        {comment.commentAuthor?.fullName?.[0] || comment.commentAuthor?.firstName?.[0] || 'U'}
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
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [newNote, setNewNote] = useState({ title: '', content: '', isPublic: false });
    const [newComment, setNewComment] = useState('');

    const lastCommentRef = useRef<HTMLDivElement | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (lastCommentRef.current) {
            lastCommentRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedNote?.noteComments?.length]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleCloseModal();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        return parsedNotes.filter((note) => note.isPublic || note.noteAuthor?.[0]?.id === currentProfile?.id);
    }, [parsedNotes, currentProfile?.id]);

    // Memoize current user info
    const currentUser = useMemo(
        () => ({
            id: currentProfile?.id,
            name: currentProfile?.fullName || currentProfile?.firstName || user?.email || 'Anonymous',
            avatar: currentProfile?.profilePicture || 'https://github.com/shadcn.png',
        }),
        [currentProfile, user],
    );

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
        if (!newNote.content.trim() || !user || !currentProfile) return;

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
        if (!editingNote || !editingNote.content.trim()) return;

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
            if (!selectedNote || !newComment.trim() || !user || !currentProfile) return;

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
                <Card className="mb-4 p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block font-medium">Catatan</label>
                            <textarea
                                placeholder="Tulis catatan Anda di sini..."
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                className="min-h-[100px] w-full resize-none rounded-lg border p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                rows={4}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNewNote({ ...newNote, isPublic: !newNote.isPublic })}
                                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-colors ${
                                        newNote.isPublic
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {newNote.isPublic ? <Icons.Globe size={16} /> : <Icons.Lock size={16} />}
                                    <span className="font-medium">{newNote.isPublic ? 'Publik' : 'Privat'}</span>
                                </button>
                                <span className="text-xs text-gray-500">
                                    {newNote.isPublic ? 'Semua orang bisa melihat' : 'Hanya Anda yang bisa melihat'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={addNote} size="sm" disabled={!newNote.content.trim()}>
                                <Icons.Check size={16} className="mr-1" />
                                Simpan
                            </Button>
                            <Button onClick={() => setShowAddNote(false)} variant="outline" size="sm">
                                Batal
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Show empty state when no notes */}
            {filteredNotes.length === 0 ? (
                <EmptyState onAddNote={handleShowAddNote} disabled={!user} />
            ) : (
                <div className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4">
                    {filteredNotes.map((note: Note) => (
                        <NoteCard key={note.id} note={note} onSelect={handleNoteSelect} />
                    ))}
                </div>
            )}

            {/* Modal Detail */}
            {selectedNote && (
                <div
                    ref={modalRef}
                    className="modal-content fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                >
                    <Card className="scrollbar-hide max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Detail Catatan</h3>
                            <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                                <Icons.X size={16} />
                            </Button>
                        </div>

                        {editingNote ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Catatan</label>
                                    <textarea
                                        value={editingNote.content}
                                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                        className="min-h-[120px] w-full resize-none rounded-lg border p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        rows={5}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingNote({
                                                ...editingNote,
                                                isPublic: !editingNote.isPublic,
                                            })
                                        }
                                        className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-colors ${
                                            editingNote.isPublic
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {editingNote.isPublic ? <Icons.Globe size={16} /> : <Icons.Lock size={16} />}
                                        <span className="font-medium">
                                            {editingNote.isPublic ? 'Publik' : 'Privat'}
                                        </span>
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        {editingNote.isPublic
                                            ? 'Semua orang bisa melihat'
                                            : 'Hanya Anda yang bisa melihat'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={updateNote} size="sm">
                                        <Icons.Check size={16} className="mr-1" />
                                        Update
                                    </Button>
                                    <Button onClick={() => setEditingNote(null)} variant="outline" size="sm">
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={
                                                selectedNote.noteAuthor?.[0]?.profilePicture ||
                                                'https://github.com/shadcn.png'
                                            }
                                        />
                                        <AvatarFallback>
                                            {selectedNote.noteAuthor?.[0]?.fullName?.[0] ||
                                                selectedNote.noteAuthor?.[0]?.firstName?.[0] ||
                                                'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-medium">
                                            {selectedNote.noteAuthor?.[0]?.fullName ||
                                                selectedNote.noteAuthor?.[0]?.firstName ||
                                                'Anonymous'}
                                        </h4>
                                        <p className="text-sm text-gray-500">{formatDate(selectedNote.createdAt)}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <div className="">
                                            {selectedNote.isPublic ? (
                                                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">
                                                    <Icons.Globe size={12} />
                                                    <span>Publik</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-500">
                                                    <Icons.Lock size={12} />
                                                    <span>Privat</span>
                                                </div>
                                            )}
                                        </div>
                                        {selectedNote.noteAuthor?.[0]?.id === currentProfile?.id && (
                                            <Button
                                                variant={'ghost'}
                                                size={'icon'}
                                                onClick={() => setEditingMode(!editingMode)}
                                            >
                                                <Icons.Ellipsis />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-4">
                                    {selectedNote.title && (
                                        <h4 className="mb-2 font-semibold text-gray-800">{selectedNote.title}</h4>
                                    )}
                                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                                        {selectedNote.content}
                                    </p>
                                </div>

                                {editingMode && selectedNote.noteAuthor?.[0]?.id === currentProfile?.id && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setEditingNote({ ...selectedNote })}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <Icons.Edit3 size={16} className="mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => deleteNote(selectedNote.id)}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-red-600 hover:text-red-700"
                                        >
                                            <Icons.Trash2 size={16} className="mr-1" />
                                            Hapus
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Realtime Comments Section */}
                        <div className="mt-4 flex flex-col gap-2">
                            <h4 className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-800">
                                <Icons.MessageSquare size={14} /> Komentar
                            </h4>

                            {/* Scrollable comments */}
                            <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                                {selectedNote.noteComments?.map((comment: Comment, index: number) => {
                                    const isLast = index === selectedNote.noteComments.length - 1;
                                    return (
                                        <div key={comment.id} ref={isLast ? lastCommentRef : null}>
                                            <CommentItem comment={comment} currentProfileId={currentProfile?.id} />
                                        </div>
                                    );
                                })}
                                {(!selectedNote.noteComments || selectedNote.noteComments.length === 0) && (
                                    <p className="text-sm text-gray-500">Belum ada komentar.</p>
                                )}
                            </div>

                            {/* Comment Form (tetap tidak scroll) */}
                            {user && (
                                <div className="flex items-start gap-2 border-t pt-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={currentProfile?.profilePicture} />
                                        <AvatarFallback>
                                            {currentProfile?.fullName?.[0] || currentProfile?.firstName?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <form onSubmit={addComment}>
                                            <input
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Tulis komentar..."
                                                className="w-full rounded border p-2 text-sm focus:ring focus:outline-none"
                                            />
                                            <div className="mt-2 flex justify-end">
                                                <Button size="sm" type="submit" disabled={!newComment.trim()}>
                                                    Kirim
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
