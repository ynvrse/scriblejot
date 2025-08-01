import { db, room } from '@/hooks/useInstantDb';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEffect, useState } from 'react';

export function getTimeGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) {
        return 'Top of the morning to you 🌞';
    } else if (hour >= 11 && hour < 14) {
        return 'Hope your day’s going well ☀️';
    } else if (hour >= 14 && hour < 16) {
        return 'Good afternoon — keep pushing 💪';
    } else if (hour >= 16 && hour < 19) {
        return 'Good evening — you’re almost there 🌇';
    } else if (hour >= 19 && hour < 22) {
        return 'Relax and unwind — you’ve earned it 🌙';
    } else {
        return 'Up late? Don’t forget to rest 😴';
    }
}

export default function Greeting() {
    const { peers } = db.rooms.usePresence(room);

    const { user, profile, isLoading } = useUserProfile();
    const [mounted, setMounted] = useState(false);
    const numUsers = 1 + Object.keys(peers).length;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Avoid hydration mismatch
    }

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200"></div>
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
        );
    }

    const greeting = getTimeGreeting();
    const displayName = profile?.firstName || profile?.fullName || user?.email?.split('@')[0] || 'User';
    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">{currentDate}</p>
                <div className="text-xs text-gray-500">Online: {numUsers}</div>
            </div>
            <br />

            <h1 className="mb-1 font-serif text-2xl">
                {greeting}, {displayName}! 👋
            </h1>
        </div>
    );
}
