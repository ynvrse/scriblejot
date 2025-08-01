import { PanelLeft, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import routes from '@/routes';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSidebar } from './hooks';

export default function Sidebar() {
    const { isOpen, close } = useSidebar();
    const { user, profile } = useUserProfile();
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
            <SheetContent side="left" className="w-[250px] pt-10">
                <SheetHeader>
                    <SheetTitle className="flex items-center justify-start">
                        <Avatar className="h-12 w-12">
                            <AvatarImage
                                src={profile?.profilePicture || ''}
                                alt={profile?.fullName || user?.email || 'User'}
                            />
                            <AvatarFallback className="text-lg">
                                {profile?.firstName?.charAt(0) || user?.email?.charAt(0) || <User size={24} />}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="mx-2">{profile?.fullName}</h1>
                        </div>
                    </SheetTitle>
                    <SheetDescription></SheetDescription>
                    <hr className="border-border mt-4 border-t" />
                </SheetHeader>

                <div className="mx-2 flex flex-col space-y-2">
                    {routes
                        .filter((route) => route.title)
                        .map(({ path, title, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path as string}
                                onClick={close}
                                className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:border"
                            >
                                {Icon ? <Icon /> : <PanelLeft className="h-5 w-5" />}
                                <span>{title}</span>
                            </Link>
                        ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
