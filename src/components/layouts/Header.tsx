import { Icons } from '@/components/icons';
import useAppConfig from '@/hooks/useStellaryst';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function Header() {
    const { stellaryst, fetchStellaryst } = useAppConfig();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const { profile, user } = useUserProfile();

    useEffect(() => {
        if (location.pathname === '/settings') {
            fetchStellaryst();
        }
    }, [location]);

    return (
        <header className="supports-backdrop-blur:bg-background/60 bg-background/90 sticky top-0 z-50 w-full border-b backdrop-blur">
            <div className="container flex h-14 items-center px-4 md:px-8">
                {/* sideBar */}

                <Link to={'/'}>
                    <div className="mr-6 flex items-center space-x-1">
                        <Icons.logo className="h-10 w-10" />
                        <span className="dark:text-accent text-primary inline-block text-lg font-bold">
                            {stellaryst?.appName}
                        </span>
                    </div>
                </Link>

                {/* right */}
                <div className="flex flex-1 cursor-pointer items-center justify-end space-x-2">
                    <nav>
                        {/* <ModeToggle /> */}
                        <Link to={'profile'}>
                            <Avatar className="mx-auto h-10 w-10">
                                <AvatarImage
                                    src={profile?.profilePicture}
                                    alt={profile?.fullName || user?.email || 'User'}
                                />
                                <AvatarFallback className="text-lg">
                                    {profile?.firstName?.charAt(0) || user?.email?.charAt(0) || <User size={24} />}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
