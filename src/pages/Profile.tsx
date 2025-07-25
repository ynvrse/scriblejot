import { PageHeader, PageHeaderHeading } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Camera, Edit2, LogOut, Save, Trash2, User, X } from 'lucide-react';

import { ModeToggle } from '@/components/mode-toggle';
import db from '@/hooks/useIDB';
import { useUserProfile } from '@/hooks/useUserProfile';
import { InstaQLEntity } from '@instantdb/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSchema } from '../../instant.schema';

type InstantFile = InstaQLEntity<AppSchema, '$files'>;

export default function Profile() {
    const { user, profile, isLoading } = useUserProfile();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        fullName: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Query $files to track uploaded files
    const { data: filesData } = db.useQuery({
        $files: {
            $: {
                where: {
                    path: {
                        $like: `profiles/${user?.id}/%`,
                    },
                },
                order: { serverCreatedAt: 'desc' },
            },
        },
    });

    // Initialize form when profile loads
    useEffect(() => {
        if (profile) {
            setEditForm({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                fullName: profile.fullName || '',
            });
        }
    }, [profile]);

    // Auto-update profile picture URL when file appears in $files query
    useEffect(() => {
        if (profile?.profilePicture && user?.id && filesData?.$files) {
            // Check if profilePicture is still a path (not a full S3 URL)
            const isPath = !profile.profilePicture.startsWith('https://');

            if (isPath) {
                // Find the file with the matching path
                const matchingFile = filesData.$files.find((f) => f.path === profile.profilePicture);

                if (matchingFile?.url) {
                    // Update profile with the actual S3 signed URL
                    db.transact([
                        db.tx.profiles[profile.id || user.id].update({
                            profilePicture: matchingFile.url,
                        }),
                    ]).catch(console.error);
                }
            }
        }
    }, [filesData, profile?.profilePicture, user?.id, profile?.id]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await db.auth.signOut();
            navigate('/');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to logout. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const deleteOldProfilePicture = async () => {
        try {
            const userFiles = filesData?.$files || [];
            // Find and delete old profile pictures
            const oldProfileFiles = userFiles.filter((file) => file.path.startsWith(`profiles/${user?.id}/avatar`));

            for (const file of oldProfileFiles) {
                await db.storage.delete(file.path);
            }
        } catch (error) {
            console.warn('Failed to delete old profile pictures:', error);
            // Don't throw error, just log warning as this is cleanup
        }
    };

    const handlePhotoUpload = async (file: File) => {
        if (!user?.id) return;

        setIsUploading(true);
        try {
            // Delete old profile pictures first
            await deleteOldProfilePicture();

            // Create unique path with timestamp
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop() || 'jpg';
            const path = `profiles/${user.id}/avatar_${timestamp}.${fileExtension}`;

            // Upload file
            const opts = {
                contentType: file.type,
                contentDisposition: 'inline',
            };

            await db.storage.uploadFile(path, file, opts);

            // Store the path temporarily - useEffect will update with S3 URL automatically
            await db.transact([
                db.tx.profiles[profile?.id || user.id].update({
                    profilePicture: path,
                    updatedAt: new Date(),
                }),
            ]);

            toast({
                title: 'Success',
                description: 'Profile picture updated successfully!',
            });
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload profile picture. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            navigate('/profile');
        }
    };

    const handleRemoveProfilePicture = async () => {
        if (!user?.id || !profile?.profilePicture) return;

        setIsUploading(true);
        try {
            // Delete all profile pictures from storage
            await deleteOldProfilePicture();

            // Update profile to remove picture URL
            await db.transact([
                db.tx.profiles[profile.id || user.id].update({
                    profilePicture: null,
                    updatedAt: new Date(),
                }),
            ]);

            toast({
                title: 'Success',
                description: 'Profile picture removed successfully!',
            });
        } catch (error) {
            console.error('Error removing photo:', error);
            toast({
                title: 'Error',
                description: 'Failed to remove profile picture. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid File',
                    description: 'Please select an image file.',
                    variant: 'destructive',
                });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File Too Large',
                    description: 'Please select an image smaller than 5MB.',
                    variant: 'destructive',
                });
                return;
            }

            handlePhotoUpload(file);
        }

        // Reset input value to allow same file selection
        event.target.value = '';
    };

    const handleSaveProfile = async () => {
        if (!user?.id) return;

        try {
            const updates: any = {};

            if (editForm.firstName !== profile?.firstName) {
                updates.firstName = editForm.firstName;
            }
            if (editForm.lastName !== profile?.lastName) {
                updates.lastName = editForm.lastName;
            }
            if (editForm.fullName !== profile?.fullName) {
                updates.fullName = editForm.fullName;
            }

            if (Object.keys(updates).length > 0) {
                updates.updatedAt = new Date();
                await db.transact([db.tx.profiles[profile?.id || user.id].update(updates)]);

                toast({
                    title: 'Success',
                    description: 'Profile updated successfully!',
                });
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Error',
                description: 'Failed to update profile. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleCancelEdit = () => {
        setEditForm({
            firstName: profile?.firstName || '',
            lastName: profile?.lastName || '',
            fullName: profile?.fullName || '',
        });
        setIsEditing(false);
    };

    // Get current user's files for debugging (optional)
    const userFiles = filesData?.$files || [];
    const currentProfileFiles = userFiles.filter((file) => file.path.startsWith(`profiles/${user?.id}/avatar`));

    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Your Profile</PageHeaderHeading>
            </PageHeader>

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Profile Picture Card */}
                <Card>
                    <CardHeader className="text-center">
                        <div className="relative mx-auto">
                            <Avatar className="mx-auto h-24 w-24">
                                <AvatarImage
                                    src={profile?.profilePicture}
                                    alt={profile?.fullName || user?.email || 'User'}
                                />
                                <AvatarFallback className="text-lg">
                                    {profile?.firstName?.charAt(0) || user?.email?.charAt(0) || <User size={24} />}
                                </AvatarFallback>
                            </Avatar>

                            {/* Photo Upload Button */}
                            <Button
                                size="sm"
                                variant="secondary"
                                className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full p-0"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                title="Change profile picture"
                            >
                                {isUploading ? (
                                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
                                ) : (
                                    <Camera size={14} />
                                )}
                            </Button>

                            {/* Remove Picture Button - Show only if picture exists */}
                            {profile?.profilePicture && !isUploading && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full p-0"
                                    onClick={handleRemoveProfilePicture}
                                    title="Remove profile picture"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        <div className="space-y-1">
                            <CardTitle className="text-xl">{profile?.fullName || 'Unnamed User'}</CardTitle>
                            <CardDescription className="text-sm">{user?.email}</CardDescription>
                        </div>

                        {/* Upload Instructions */}
                        <p className="text-muted-foreground mt-2 text-xs">
                            Click camera icon to upload • Max 5MB • JPG, PNG, GIF supported
                        </p>
                    </CardHeader>
                </Card>

                {/* Profile Information Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg">Profile Information</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} disabled={isEditing}>
                            <Edit2 size={14} className="mr-2" />
                            Edit
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {isEditing ? (
                            // Edit Mode
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={editForm.fullName}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={editForm.firstName}
                                            onChange={(e) =>
                                                setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
                                            }
                                            placeholder="First name"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={editForm.lastName}
                                            onChange={(e) =>
                                                setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
                                            }
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button onClick={handleSaveProfile} size="sm">
                                        <Save size={14} className="mr-2" />
                                        Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelEdit} size="sm">
                                        <X size={14} className="mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-muted-foreground text-sm font-medium">Full Name</Label>
                                    <p className="text-sm">{profile?.fullName || '-'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">First Name</Label>
                                        <p className="text-sm">{profile?.firstName || '-'}</p>
                                    </div>

                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">Last Name</Label>
                                        <p className="text-sm">{profile?.lastName || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-muted-foreground text-sm font-medium">Email</Label>
                                    <p className="text-sm">{user?.email}</p>
                                </div>

                                {profile?.updatedAt && (
                                    <div>
                                        <Label className="text-muted-foreground text-sm font-medium">
                                            Last Updated
                                        </Label>
                                        <p className="text-sm">{new Date(profile.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg">Set Themes</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} disabled={isEditing}>
                            <Edit2 size={14} className="mr-2" />
                            Edit
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <ModeToggle />
                    </CardContent>
                </Card>

                {/* Logout Button */}
                <Card>
                    <CardContent className="pt-6">
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive flex w-full items-center justify-center gap-2"
                        >
                            <LogOut size={14} />
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
