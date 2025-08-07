import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Edit2, LogOut, Save, Trash2, User, X } from 'lucide-react';

import { db } from '@/hooks/useInstantDb';
import { useUserProfile } from '@/hooks/useUserProfile';
import Footer from '@/sections/Footer';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, profile, avatar, isLoading } = useUserProfile();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        fullName: '',
    });

    // const { data } = db.useQuery({
    //     $files: {
    //         $: {
    //             where: {
    //                 path: profile?.profilePicture,
    //             },
    //         },
    //     },
    // });

    const fileInputRef = useRef<HTMLInputElement>(null);

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
            throw console.error(error);
        }
    };

    const deleteOldProfilePicture = async () => {
        if (!profile?.profilePicture) return; // pastikan ada file yang akan dihapus
        try {
            await db.storage.delete(profile.profilePicture); // Hapus berdasarkan path yang disimpan
        } catch (error) {
            console.error('Failed to delete old profile picture:', error);
        }
    };

    const handlePhotoUpload = async (file: File) => {
        if (!user?.id) return;

        setIsUploading(true);
        try {
            // 1. Hapus gambar lama jika ada
            await deleteOldProfilePicture();

            // 2. Buat path unik
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop() || 'jpg';
            const path = `profiles/${user.id}/avatar_${timestamp}.${fileExtension}`;

            const opts = {
                contentType: file.type,
                contentDisposition: 'inline', // bisa diganti jadi 'attachment' jika ingin diunduh
            };

            // 3. Upload file (menggunakan API yang sesuai dokumentasi)
            await db.storage.uploadFile(path, file, opts);

            // 4. Simpan path file, bukan URL (nanti query ke $files bisa ambil URL)
            await db.transact([
                db.tx.profiles[profile?.id || user.id].update({
                    profilePicture: path,
                    updatedAt: new Date().toISOString(),
                }),
            ]);
        } catch (error) {
            console.error('Error uploading photo:', error);
        } finally {
            setIsUploading(false);
            navigate('/setting');
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
                    profilePicture: '',
                    updatedAt: new Date().toISOString(),
                }),
            ]);
        } catch (error) {
            console.error('Error removing photo:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Please select an image smaller than 5MB.');
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
                updates.updatedAt = new Date().toISOString();
                await db.transact([db.tx.profiles[profile?.id || user.id].update(updates)]);
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
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

    return (
        <>
            <div className="flex items-center justify-between space-y-2 pt-6 pb-4">
                <h1 className="my-1 text-3xl font-semibold tracking-tight">Your Profile</h1>
            </div>

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Profile Picture Card */}
                <Card>
                    {}
                    <CardHeader className="text-center">
                        <div className="relative mx-auto">
                            <Avatar className="mx-auto h-24 w-24">
                                <AvatarImage
                                    src={avatar || 'avatar'}
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

                {/* Logout Button */}
                <Card>
                    <CardContent className="pt-6">
                        <Button
                            onClick={handleLogout}
                            variant="destructive"
                            size="sm"
                            className="flex w-full items-center justify-center gap-2 hover:bg-red-500"
                        >
                            <LogOut size={14} />
                            Logout
                        </Button>
                    </CardContent>
                </Card>

                <Footer />
            </div>
        </>
    );
}
