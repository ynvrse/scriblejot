import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import formatRelativeTime from '@/lib/utils';

import * as Icons from 'lucide-react';
import { memo } from 'react';
import { Comment, useNoteSection } from './useNoteSection';

const CommentItem = memo(({ comment, currentProfileId }: { comment: Comment; currentProfileId?: string }) => {
    const { getProfilePictureUrl } = useNoteSection();

    // Default anggap komen milik sendiri jika belum ada author
    const isOwnComment = !comment.commentAuthor?.[0]?.id || comment.commentAuthor?.[0]?.id === currentProfileId;

    const isLeft = comment.commentAuthor?.[0]?.id && comment.commentAuthor?.[0]?.id !== currentProfileId;

    return (
        <div className={`flex items-start gap-3 ${isOwnComment ? 'justify-end' : ''}`}>
            {isLeft && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={getProfilePictureUrl(comment.commentAuthor?.[0]) || 'avatar'} />
                    <AvatarFallback>
                        {comment.commentAuthor?.[0]?.fullName || comment.commentAuthor?.[0]?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
            )}

            <div
                className={`max-w-[75%] min-w-[150px] rounded-lg p-2 text-sm break-words ${
                    isLeft ? 'bg-foreground/10 self-end text-left' : 'bg-foreground/20 self-end'
                }`}
            >
                <p className="font-serif">
                    {isOwnComment
                        ? 'Anda'
                        : comment.commentAuthor?.[0]?.fullName || comment.commentAuthor?.[0]?.firstName || 'Anonymous'}
                </p>

                <p className="text-foreground/50 text-xs">{formatRelativeTime(comment.createdAt)}</p>

                <p className="mt-2 text-left leading-relaxed break-words whitespace-pre-wrap">{comment.content}</p>
            </div>

            {isOwnComment && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={getProfilePictureUrl(comment.commentAuthor?.[0]) || 'avatar'} />
                    <AvatarFallback>
                        <Icons.User />
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
});

export default CommentItem;
