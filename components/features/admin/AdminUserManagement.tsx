'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { User } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MoreHorizontal,
    Shield,
    ShieldAlert,
    UserX,
    UserCheck,
    Search,
    Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AdminUserManagement() {
    const { fetchAllUsers, changeUserRole, changeUserStatus, loading } = useAdmin();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadUsers = React.useCallback(async () => {
        setIsLoading(true);
        const data = await fetchAllUsers();
        setUsers(data);
        setIsLoading(false);
    }, [fetchAllUsers]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleRoleChange = async (userId: string, newRole: string, isAdmin: boolean) => {
        const updated = await changeUserRole(userId, newRole, isAdmin);
        if (updated) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: updated.role, isAdmin: updated.isAdmin } : u));
        }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        const updated = await changeUserStatus(userId, newStatus);
        if (updated) {
            setUsers(users.map(u => u.id === userId ? { ...u, status: updated.status } : u));
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function getInitials(name: string) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by name or email..."
                        className="pl-8 bg-white/50 dark:bg-zinc-900/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Total Users: {filteredUsers.length}
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No users found matching "{searchTerm}"
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.profilePictureUrl || undefined} />
                                                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-sm flex items-center gap-1.5">
                                                    {user.fullName}
                                                    {user.isAdmin && (
                                                        <Shield className="h-3.5 w-3.5 text-rose-500" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isAdmin ? 'default' : 'secondary'} className={user.isAdmin ? 'bg-rose-500 hover:bg-rose-600' : 'capitalize'}>
                                            {user.isAdmin ? 'Admin' : user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${user.status === 'active' ? 'text-green-600 border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20' :
                                                user.status === 'suspended' ? 'text-red-600 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20' : ''
                                            }`}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Modify Role</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'student', false)}>
                                                    Set as Student
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'faculty', false)}>
                                                    Set as Faculty
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin', true)} className="text-rose-600 dark:text-rose-400">
                                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                                    Make Admin
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Account Status</DropdownMenuLabel>

                                                {user.status === 'active' ? (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')} className="text-red-600 dark:text-red-400">
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        Suspend User
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')} className="text-green-600 dark:text-green-400">
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        Restore User
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
