import { initDB } from '@/config/db';
import { Stellaryst } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const useStellaryst = () => {
    const navigate = useNavigate();
    const [stellaryst, setStellaryst] = useState<Stellaryst | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchStellaryst = useCallback(async () => {
        setLoading(true);
        try {
            const db = await initDB();
            const app = await db.get('stellaryst', 1);
            setStellaryst(app);
        } catch (error) {
            console.error('Failed to fetch Config:', error);
            toast.error('Gagal mengambil konfigurasi');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateApp = useCallback(
        async (newConfigApp: Stellaryst) => {
            try {
                const db = await initDB();
                await db.put('stellaryst', { ...newConfigApp, updatedAt: new Date() });
                await fetchStellaryst();
                toast.success('Data berhasil diperbarui!');
                navigate('/settings');
            } catch (error) {
                console.error('Gagal memperbarui data settings:', error);
                toast.error('Gagal memperbarui data');
            }
        },
        [fetchStellaryst, navigate],
    );

    useEffect(() => {
        let isMounted = true;
        const safeConfigFetch = async () => {
            if (isMounted) {
                await fetchStellaryst();
            }
        };

        safeConfigFetch();

        return () => {
            isMounted = false;
        };
    }, [fetchStellaryst]);

    const resetApp = useCallback(async (databaseName: string) => {
        await indexedDB.deleteDatabase(databaseName);
        setTimeout(() => {
            navigate('/');
        }, 500);
        toast.success(`Aplikasi Berhasil Direset`);
    }, []);

    function getGreetingByTime(date: Date = new Date()): string {
        const hour = date.getHours();

        if (hour >= 4 && hour < 11) {
            return 'Selamat pagi';
        } else if (hour >= 11 && hour < 15) {
            return 'Selamat siang';
        } else if (hour >= 15 && hour < 18) {
            return 'Selamat sore';
        } else {
            return 'Selamat malam';
        }
    }

    return {
        stellaryst,
        loading,
        fetchStellaryst,
        updateApp,
        resetApp,
        getGreetingByTime,
    };
};

export default useStellaryst;
