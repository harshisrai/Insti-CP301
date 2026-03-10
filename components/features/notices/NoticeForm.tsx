'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Send, Target, ShieldCheck, Tag, Save } from 'lucide-react';
import type { Notice, NoticeCategory, NoticePriority, NoticeStatus } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface NoticeFormProps {
    initialData?: Notice;
    onSubmit: (data: Partial<Notice> & { status: NoticeStatus }) => Promise<boolean>;
    isEdit?: boolean;
}

export function NoticeForm({ initialData, onSubmit, isEdit = false }: NoticeFormProps) {
    const router = useRouter();
    const { user, activePositions, selectedIdentityId, setSelectedIdentityId } = useAuth();

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [category, setCategory] = useState<NoticeCategory>(initialData?.category || 'general');
    const [priority, setPriority] = useState<NoticePriority>(initialData?.priority || 'medium');

    const [targetRoles, setTargetRoles] = useState(initialData?.targetRoles?.join(', ') || '');
    const [targetDepartments, setTargetDepartments] = useState(initialData?.targetDepartments?.join(', ') || '');
    const [targetBatches, setTargetBatches] = useState(initialData?.targetBatches?.join(', ') || '');
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

    const canPostPersonal = user?.role === 'faculty' || user?.role === 'staff';

    useEffect(() => {
        if (!user) return;
        if (!canPostPersonal && selectedIdentityId === null && !isEdit) {
            router.replace('/notices');
        }
    }, [user, selectedIdentityId, router, canPostPersonal, isEdit]);

    useEffect(() => {
        if (initialData?.postingIdentityId) {
            setSelectedIdentityId(initialData.postingIdentityId);
        }
    }, [initialData, setSelectedIdentityId]);

    const submitAction = async (status: NoticeStatus) => {
        if (!canPostPersonal && selectedIdentityId === null) return;

        setLoading(true);
        const parseCommaList = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

        const success = await onSubmit({
            title,
            content,
            category,
            priority,
            postingIdentityId: selectedIdentityId || undefined,
            tags: parseCommaList(tags),
            targetRoles: parseCommaList(targetRoles),
            targetDepartments: parseCommaList(targetDepartments),
            targetBatches: parseCommaList(targetBatches),
            isActive: initialData?.isActive ?? true,
            isPinned: initialData?.isPinned ?? false,
            status,
        });

        setLoading(false);
        if (success) {
            router.push('/notices');
        }
    };

    return (
        <div className="space-y-8">
            <GlassSurface className="p-6 sm:p-8">
                <div className="space-y-6">
                    {/* Title & Content */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Notice Title <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            placeholder="e.g., Extension of Library Hours During Exams"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="text-lg py-6 bg-black/5 dark:bg-white/5 border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Detailed Content <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="content"
                            placeholder="Write the full notice content here... (Markdown supported)"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="min-h-[200px] resize-y bg-black/5 dark:bg-white/5 border-border leading-relaxed"
                        />
                    </div>

                    {/* Classification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Category
                            </Label>
                            <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                                <SelectTrigger className="bg-black/5 dark:bg-white/5 border-border">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="administrative">Administrative</SelectItem>
                                    <SelectItem value="placement">Placement</SelectItem>
                                    <SelectItem value="hostel">Hostel</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="wellness">Wellness</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Priority Level
                            </Label>
                            <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                                <SelectTrigger className="bg-black/5 dark:bg-white/5 border-border">
                                    <SelectValue placeholder="Select Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urgent"><span className="text-red-500 font-bold">Urgent</span></SelectItem>
                                    <SelectItem value="high"><span className="text-amber-500 font-bold">High</span></SelectItem>
                                    <SelectItem value="medium"><span className="text-blue-500 font-medium">Medium</span></SelectItem>
                                    <SelectItem value="low"><span className="text-green-500 font-medium">Low</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border/50">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent-gold" /> Post As (Identity)
                        </Label>
                        <Select
                            value={selectedIdentityId || 'base_role'}
                            onValueChange={(val) => setSelectedIdentityId(val === 'base_role' ? null : val)}
                        >
                            <SelectTrigger className="bg-black/5 dark:bg-white/5 border-border">
                                <SelectValue placeholder="Select Identity" />
                            </SelectTrigger>
                            <SelectContent>
                                {canPostPersonal && (
                                    <SelectItem value="base_role">Personal Identity ({user?.role})</SelectItem>
                                )}
                                {activePositions && activePositions.map(pos => (
                                    <SelectItem key={pos.id} value={pos.id}>
                                        <span className="font-semibold text-accent-gold">{pos.title}</span>
                                        <span className="text-muted-foreground ml-2">({pos.org?.name})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">If you have an official organization position, you can post this notice under that authoritative identity.</p>
                    </div>
                </div>
            </GlassSurface>

            <GlassSurface className="p-6 sm:p-8 bg-black/10 dark:bg-white/5 border-dashed border-border/60">
                <div className="space-y-4">
                    <div className="flex flex-col gap-1 mb-4">
                        <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                            <Target className="w-5 h-5 text-accent-cyan" />
                            Audience Targeting (Optional)
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Leave these fields blank to make the notice globally visible. Separate multiple values with commas (e.g., "2024, 2025").
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="targetRoles" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Roles</Label>
                            <Input
                                id="targetRoles"
                                placeholder="student, faculty, staff"
                                value={targetRoles}
                                onChange={e => setTargetRoles(e.target.value)}
                                className="bg-black/10 dark:bg-black/20 border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="targetBatches" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Batches</Label>
                            <Input
                                id="targetBatches"
                                placeholder="2024, 2025, 2026"
                                value={targetBatches}
                                onChange={e => setTargetBatches(e.target.value)}
                                className="bg-black/10 dark:bg-black/20 border-border"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="targetDepartments" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Departments</Label>
                            <Input
                                id="targetDepartments"
                                placeholder="Computer Science & Engineering, Electrical Engineering"
                                value={targetDepartments}
                                onChange={e => setTargetDepartments(e.target.value)}
                                className="bg-black/10 dark:bg-black/20 border-border"
                            />
                        </div>
                    </div>
                </div>
            </GlassSurface>

            <div className="flex justify-end gap-3 pt-4 pb-20">
                <Button
                    type="button"
                    variant="outline"
                    disabled={loading || !title || !content}
                    onClick={() => submitAction('draft')}
                    className="px-6 py-6 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/50 transition-colors"
                >
                    <Save className="w-5 h-5" /> Save Draft
                </Button>
                <Button
                    type="button"
                    disabled={loading || !title || !content}
                    onClick={() => submitAction('published')}
                    className="px-8 py-6 rounded-xl font-bold text-lg flex items-center gap-2"
                >
                    {loading ? 'Publishing...' : (
                        <>
                            <Send className="w-5 h-5" /> Publish Notice
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
