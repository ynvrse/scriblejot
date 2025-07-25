// pages/Setting.tsx
import LoadingScreen from '@/components/LoadingScreen';
import { ModeToggle } from '@/components/mode-toggle';
import { PageHeader, PageHeaderHeading } from '@/components/page-header';
import useSetting from '@/hooks/useStellaryst';
import formatRelativeTime from '@/lib/utils';
import { Stellaryst } from '@/types';
import { useEffect, useState } from 'react';
import SettingCard from './partials/SettingCard';
import SettingForm from './partials/SettingForm';

export default function Setting() {
    const { stellaryst, updateApp, loading, resetApp } = useSetting();
    const [isShowGithub, setIsShowGithub] = useState<boolean>(false);
    const [app, setApp] = useState<Stellaryst>({
        appName: stellaryst?.appName || '',
        name: stellaryst?.name || '',
        owner: stellaryst?.owner || '',
        gitHub: stellaryst?.gitHub || '',
        sourceCode: stellaryst?.sourceCode || '',
        createdAt: stellaryst?.createdAt || new Date(),
        updatedAt: stellaryst?.updatedAt || null,
    });

    useEffect(() => {
        if (stellaryst) {
            setApp(stellaryst);
        }
    }, [stellaryst]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setApp((prev) => ({ ...prev, [id]: value }));
    };

    if (loading) return <LoadingScreen loading={loading} />;

    return (
        <>
            <PageHeader>
                <PageHeaderHeading className="flex w-full items-center justify-between">
                    <p>Settings Page</p>
                    <div>
                        <ModeToggle />
                    </div>
                </PageHeaderHeading>
            </PageHeader>

            <SettingCard isShowGithub={isShowGithub} setIsShowGithub={setIsShowGithub}>
                <SettingForm
                    app={app}
                    isShowGithub={isShowGithub}
                    handleInputChange={handleInputChange}
                    updateApp={updateApp}
                    resetApp={resetApp}
                />
            </SettingCard>

            <div className="flex items-center justify-between gap-1">
                <p className="text-muted-foreground text-sm font-light">Dibuat: {formatRelativeTime(app.createdAt)}</p>
                {app.updatedAt && (
                    <p className="text-muted-foreground text-sm">Diubah: {formatRelativeTime(app.updatedAt)}</p>
                )}
            </div>
        </>
    );
}
