import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, LayoutGrid } from 'lucide-react';

interface SettingCardProps {
    isShowGithub: boolean;
    setIsShowGithub: (value: boolean) => void;
    children: React.ReactNode;
}

export default function SettingCard({ isShowGithub, setIsShowGithub, children }: SettingCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{isShowGithub ? 'Github Settings' : 'App Settings'}</CardTitle>
                        <CardDescription>
                            {isShowGithub ? 'Manage your Github informations here.' : 'Update your app settings here.'}
                        </CardDescription>
                    </div>
                    <div>
                        <Button variant="ghost" size="icon" onClick={() => setIsShowGithub(!isShowGithub)}>
                            {!isShowGithub ? <Github /> : <LayoutGrid />}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
