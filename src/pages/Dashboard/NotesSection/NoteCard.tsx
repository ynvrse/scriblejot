import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import formatRelativeTime from '@/lib/utils';
import * as Icons from 'lucide-react';
import { memo, useCallback } from 'react';
import { Note, useNoteSection } from './useNoteSection';

const NoteCard = memo(
    ({
        note,
        onSelect,
        currentProfileId,
    }: {
        note: Note;
        onSelect: (note: Note) => void;
        currentProfileId?: string;
    }) => {
        const handleClick = useCallback(() => {
            onSelect(note);
        }, [note, onSelect]);

        const { getProfilePictureUrl } = useNoteSection();

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
                    <AvatarImage src={getProfilePictureUrl(note.noteAuthor?.[0]) || 'avatar'} />
                    <AvatarFallback>
                        {note.noteAuthor?.[0]?.fullName?.[0] || note.noteAuthor?.[0]?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 pt-1">
                    <div className="mb-2 flex items-center gap-2">
                        <h3 className="truncate font-serif text-sm">
                            {note.noteAuthor?.[0]?.id == currentProfileId
                                ? 'Anda'
                                : note.noteAuthor?.[0]?.fullName || note.noteAuthor?.[0]?.firstName || 'Anonymous'}
                        </h3>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="line-clamp-1 font-mono text-xs">{formatRelativeTime(note.createdAt)}</span>
                    </div>
                    {/* {note.title && <h4 className="mb-1 line-clamp-1 text-sm font-semibold text-gray-800">{note.title}</h4>} */}
                    <p className="line-clamp-3 text-sm leading-relaxed break-words">{note.content}</p>
                </div>
            </Card>
        );
    },
);

export default NoteCard;
