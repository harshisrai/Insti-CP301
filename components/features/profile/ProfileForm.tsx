'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import type { UpdateProfileRequest } from '@/lib/types';
import { useProfile } from '@/lib/hooks/useProfile';
import { useIdentities } from '@/lib/hooks/useIdentities';
import { PositionBadge } from './PositionBadge';

export function ProfileForm() {
    const { user } = useAuth();
    const { profile, loading: profileLoading, updateProfile } = useProfile();
    const { positions, loading: configLoading } = useIdentities();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState<UpdateProfileRequest>({});

    const isLoading = profileLoading || configLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user || !profile) {
        return <div className="text-center p-8 text-red-500">Failed to load profile.</div>;
    }

    const handleEditClick = () => {
        setFormData({
            fullName: profile.fullName,
            department: profile.department || '',
            branch: profile.branch || '',
            batch: profile.batch || '',
            phoneNumber: profile.phoneNumber || '',
            bio: profile.bio || '',
            linkedinUrl: profile.linkedinUrl || '',
        });
        setError('');
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        const success = await updateProfile(formData);
        if (success) {
            setIsEditing(false);
        } else {
            setError('Failed to update profile. Please try again.');
        }
        setIsSaving(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const isStudent = user.role === 'student';
    const isFacultyOrStaff = user.role === 'faculty' || user.role === 'staff';
    const isAlumni = user.role === 'alumni';

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Profile Header Card */}
            <GlassSurface className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-accent-gold/20 to-transparent opacity-50 pointer-events-none" />

                <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-background flex items-center justify-center shrink-0 shadow-md z-10">
                    <UserIcon className="h-10 w-10 text-muted-foreground" />
                </div>

                <div className="flex-1 text-center md:text-left z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                        <div>
                            <h1 className="text-2xl font-bold font-serif">{profile.fullName}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mt-1">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{profile.email}</span>
                                {profile.isVerified && (
                                    <div title="Institution Verified" className="inline-flex items-center ml-1">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {!isEditing && (
                            <Button onClick={handleEditClick} variant="outline" size="sm" className="mt-4 md:mt-0">
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {/* Main Role & Department Badge */}
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                            {profile.role}
                        </span>
                        {profile.department && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                {profile.department}
                            </span>
                        )}
                    </div>
                </div>
            </GlassSurface>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Form/Details */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassSurface className="p-6">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-accent-gold rounded-full block" />
                            Profile Details
                        </h2>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
                                {error}
                            </div>
                        )}

                        {!isEditing ? (
                            <div className="space-y-6 divide-y divide-black/5 dark:divide-white/5">
                                {/* View Mode */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 pb-6">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                                        <div className="mt-1 font-medium text-sm">{profile.fullName}</div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Phone Number</Label>
                                        <div className="mt-1 font-medium text-sm">{profile.phoneNumber || '—'}</div>
                                    </div>
                                    {(isStudent || isAlumni) && (
                                        <>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Branch</Label>
                                                <div className="mt-1 font-medium text-sm">{profile.branch || '—'}</div>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Batch</Label>
                                                <div className="mt-1 font-medium text-sm">{profile.batch || '—'}</div>
                                            </div>
                                        </>
                                    )}
                                    {isStudent && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Enrollment Number</Label>
                                            <div className="mt-1 font-medium text-sm">{profile.enrollmentNumber || '—'}</div>
                                        </div>
                                    )}
                                    {isFacultyOrStaff && (
                                        <>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Designation</Label>
                                                <div className="mt-1 font-medium text-sm">{profile.designation || '—'}</div>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Employee ID</Label>
                                                <div className="mt-1 font-medium text-sm">{profile.employeeId || '—'}</div>
                                            </div>
                                        </>
                                    )}
                                    {isAlumni && (
                                        <>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Current Organization</Label>
                                                <div className="mt-1 font-medium text-sm">{profile.currentOrganization || '—'}</div>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Current Position</Label>
                                                <div className="mt-1 font-medium text-sm">{profile.currentPosition || '—'}</div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-6 space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground block mb-2">Bio</Label>
                                        <div className="text-sm border-l-2 border-accent-gold/50 pl-4 py-1 text-muted-foreground whitespace-pre-wrap">
                                            {profile.bio || 'No bio provided. Add a short description about yourself!'}
                                        </div>
                                    </div>
                                    {profile.linkedinUrl && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground block mb-1">LinkedIn URL</Label>
                                            <a
                                                href={profile.linkedinUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-accent-gold hover:underline mt-1 inline-block truncate max-w-full"
                                            >
                                                {profile.linkedinUrl}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Edit Mode */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+91..." />
                                    </div>

                                    {(isStudent || isAlumni) && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="branch">Branch</Label>
                                                <Input id="branch" name="branch" value={formData.branch} onChange={handleChange} placeholder="e.g. Computer Science" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="batch">Batch (Graduation Year)</Label>
                                                <Input id="batch" name="batch" value={formData.batch} onChange={handleChange} placeholder="e.g. 2024" />
                                            </div>
                                        </>
                                    )}

                                    {isFacultyOrStaff && (
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science and Engineering" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Tell the community a bit about yourself..."
                                        className="resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                                    <Input id="linkedinUrl" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                                    <Button type="button" variant="ghost" onClick={handleCancelClick} disabled={isSaving}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving} className="bg-accent-gold hover:bg-accent-gold/90 text-white">
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        )}
                    </GlassSurface>
                </div>

                {/* Right Col: Positions (PORs) */}
                <div className="space-y-6">
                    <GlassSurface className="p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-accent-gold" />
                            Positions (PORs)
                        </h2>

                        <div className="space-y-3">
                            {positions.length > 0 ? (
                                <>
                                    {positions.map((pos) => (
                                        <PositionBadge key={pos.id} position={pos} />
                                    ))}
                                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                                        Your active positions allow you to post official content on behalf of these organizations.
                                    </p>
                                </>
                            ) : (
                                <div className="py-8 text-center bg-black/5 dark:bg-white/5 rounded-lg border border-dashed border-black/10 dark:border-white/10">
                                    <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2 mt-2" />
                                    <p className="text-sm text-foreground font-medium">No Official Positions</p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto mb-2">
                                        You currently do not hold any active Positions of Responsibility.
                                    </p>
                                </div>
                            )}
                        </div>
                    </GlassSurface>
                </div>
            </div>
        </div>
    );
}
