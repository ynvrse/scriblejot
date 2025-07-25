import { init } from '@instantdb/react';
import { useEffect, useState } from 'react';

const APP_ID = 'b31ef944-da66-44be-a7dc-f5daae90fa61';
const db = init({ appId: APP_ID });

// Hook untuk mendapatkan profil user
function useUserProfile() {
    const { user } = db.useAuth();

    const { isLoading, error, data } = db.useQuery(
        user
            ? {
                  profiles: {
                      $: {
                          where: {
                              id: user.id,
                          },
                      },
                  },
              }
            : null,
    );

    return {
        user,
        profile: data?.profiles?.[0],
        isLoading,
        error,
    };
}

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
    const { user, profile, isLoading } = useUserProfile();
    const [mounted, setMounted] = useState(false);

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
            <h1 className="mb-1 text-2xl font-bold">
                {greeting}, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground text-sm">{currentDate}</p>
        </div>
    );
}
