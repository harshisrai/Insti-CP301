'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Send } from 'lucide-react';

interface CreatePostInputProps {
    onPostCreated: (content: string, mediaUrls?: string[]) => Promise<boolean>;
}

export function CreatePostInput({ onPostCreated }: CreatePostInputProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const authorName = user?.fullName || 'User';
    const authorInitials = authorName.substring(0, 2).toUpperCase();

    const handleSubmit = async () => {
        if (!content.trim() || !user) return;

        setIsSubmitting(true);
        const success = await onPostCreated(content);
        setIsSubmitting(false);

        if (success) {
            setContent('');
        }
    };

    if (!user) return null;

    return (
        <GlassSurface className="p-4 mb-6">
            <div className="flex gap-4">
                <Avatar className="w-10 h-10 border border-border/50 hidden sm:block">
                    <AvatarImage src={user.profilePictureUrl} alt={authorName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {authorInitials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share something with the community..."
                        className="min-h-[80px] text-base resize-none bg-transparent border-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/60 shadow-none"
                    />

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-amber-500 h-9 w-9 rounded-full">
                                <ImageIcon size={18} />
                            </Button>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || isSubmitting}
                            variant="primary"
                            className="gap-2 rounded-full px-5"
                            isLoading={isSubmitting}
                        >
                            <Send size={16} />
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </GlassSurface>
    );
}
