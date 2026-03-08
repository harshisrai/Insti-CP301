'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { OrgMember, UserPosition, User } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, UserMinus, ShieldCheck, Edit } from 'lucide-react';

interface AdminOrgRosterProps {
    orgId: string;
    orgName: string;
}

export function AdminOrgRoster({ orgId, orgName }: AdminOrgRosterProps) {
    const { fetchOrgMembers, fetchOrgPositions, assignPOR, revokePOR, addMember, removeMember, fetchAllUsers, updateOrg, error: adminError } = useAdmin();

    const [members, setMembers] = useState<OrgMember[]>([]);
    const [positions, setPositions] = useState<UserPosition[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isAssignPOROpen, setIsAssignPOROpen] = useState(false);
    const [isEditOrgOpen, setIsEditOrgOpen] = useState(false);

    // Form states
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [porTitle, setPorTitle] = useState('');
    const [porType, setPorType] = useState<any>('secretary');

    // Edit Org Form states
    const [editOrgName, setEditOrgName] = useState(orgName);
    const [editOrgDescription, setEditOrgDescription] = useState('');
    const [isEditingOrg, setIsEditingOrg] = useState(false);

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        const [memData, posData, usersData] = await Promise.all([
            fetchOrgMembers(orgId),
            fetchOrgPositions(orgId),
            fetchAllUsers()
        ]);
        setMembers(memData);
        setPositions(posData);
        setAllUsers(usersData);
        setIsLoading(false);
    }, [orgId, fetchOrgMembers, fetchOrgPositions, fetchAllUsers]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddMember = async () => {
        if (!selectedUserId) return;
        const newMember = await addMember(orgId, selectedUserId);
        if (newMember) {
            setMembers([...members, newMember]);
            setIsAddMemberOpen(false);
            setSelectedUserId('');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        const success = await removeMember(orgId, userId);
        if (success) {
            setMembers(members.filter(m => m.userId !== userId));
        }
    };

    const handleAssignPOR = async () => {
        if (!selectedUserId || !porTitle) return;

        const newPor = await assignPOR({
            userId: selectedUserId,
            orgId: orgId,
            title: porTitle,
            porType: porType,
            validFrom: new Date().toISOString(),
            isActive: true
        });

        if (newPor) {
            setPositions([...positions, newPor]);
            setIsAssignPOROpen(false);
            setSelectedUserId('');
            setPorTitle('');
        }
    };

    const handleRevokePOR = async (positionId: string) => {
        const success = await revokePOR(positionId);
        if (success) {
            setPositions(positions.filter(p => p.id !== positionId));
        }
    };

    const handleEditOrg = async () => {
        if (!editOrgName) return;
        setIsEditingOrg(true);
        const updated = await updateOrg(orgId, {
            name: editOrgName,
            description: editOrgDescription || undefined
        });
        if (updated) {
            setIsEditOrgOpen(false);
            setEditOrgName(updated.name);
            setEditOrgDescription(updated.description || '');
            // NOTE: Ideally we'd trigger a refetch in AdminOrgManagement to update the sidebar, 
            // but this updates the roster header via state.
        }
        setIsEditingOrg(false);
    };

    function getInitials(name: string) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
    }

    // Helper to find PORs for a specific user
    const getUserPORs = (userId: string) => positions.filter(p => p.userId === userId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium">{editOrgName} Roster</h3>
                    <Dialog open={isEditOrgOpen} onOpenChange={setIsEditOrgOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Organization</DialogTitle>
                                <DialogDescription>
                                    Update details for {editOrgName}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input id="edit-name" value={editOrgName} onChange={e => setEditOrgName(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-desc">Description</Label>
                                    <Textarea id="edit-desc" value={editOrgDescription} onChange={e => setEditOrgDescription(e.target.value)} placeholder="Organization description..." />
                                </div>
                                {adminError && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md mt-2">
                                        {adminError}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="outline" onClick={() => setIsEditOrgOpen(false)}>Cancel</Button>
                                <Button onClick={handleEditOrg} disabled={!editOrgName || isEditingOrg}>
                                    {isEditingOrg ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Changes
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAssignPOROpen} onOpenChange={setIsAssignPOROpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/20">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Assign POR
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Assign Position of Responsibility</DialogTitle>
                                <DialogDescription>
                                    Grant official posting rights and authority for {orgName}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Select User</Label>
                                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map(m => (
                                                <SelectItem key={m.userId} value={m.userId}>
                                                    {m.user?.fullName} ({m.user?.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Exact Title (e.g., General Secretary)</Label>
                                    <Input
                                        placeholder="e.g. General Secretary"
                                        value={porTitle}
                                        onChange={e => setPorTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Position Level</Label>
                                    <Select value={porType} onValueChange={setPorType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="secretary">Secretary (Highest)</SelectItem>
                                            <SelectItem value="representative">Representative</SelectItem>
                                            <SelectItem value="coordinator">Coordinator</SelectItem>
                                            <SelectItem value="mentor">Mentor</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={handleAssignPOR} disabled={!selectedUserId || !porTitle}>
                                    Grant Official POR
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Member to {orgName}</DialogTitle>
                                <DialogDescription>
                                    Add a new user to the organization roster.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Select User</Label>
                                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search users by name..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* In a real app, this should be an async search combobox. For now, showing first 50 users not in org */}
                                            {allUsers
                                                .filter(u => !members.find(m => m.userId === u.id))
                                                .slice(0, 50)
                                                .map(u => (
                                                    <SelectItem key={u.id} value={u.id}>
                                                        {u.fullName} ({u.email})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full" onClick={handleAddMember} disabled={!selectedUserId}>
                                    Add to Roster
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    No members currently in roster.
                </div>
            ) : (
                <div className="space-y-2">
                    {members.map(member => {
                        const user = member.user;
                        if (!user) return null;

                        const userPors = getUserPORs(user.id);

                        return (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.profilePictureUrl || undefined} />
                                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {user.fullName}
                                            {userPors.map(por => (
                                                <Badge key={por.id} variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-xs px-1.5 py-0">
                                                    {por.title}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {userPors.map(por => (
                                        <Button
                                            key={por.id}
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 h-8"
                                            onClick={() => handleRevokePOR(por.id)}
                                        >
                                            Revoke {por.title}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => handleRemoveMember(user.id)}
                                    >
                                        <UserMinus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
