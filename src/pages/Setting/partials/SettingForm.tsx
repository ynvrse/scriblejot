import ActionDialog from '@/components/ActionDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stellaryst } from '@/types';

interface SettingFormProps {
    app: Stellaryst;
    isShowGithub: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    updateApp: (app: Stellaryst) => void;
    resetApp: (dbName: string) => void;
}

export default function SettingForm({ app, isShowGithub, handleInputChange, updateApp, resetApp }: SettingFormProps) {
    return (
        <div className="flex flex-col gap-4">
            {!isShowGithub ? (
                <>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        value={app.name}
                        placeholder="Your Name"
                        onChange={handleInputChange}
                    />
                    <Label htmlFor="owner">Owner</Label>
                    <Input id="owner" type="text" value={app.owner} placeholder="Owner" onChange={handleInputChange} />
                </>
            ) : (
                <>
                    <Label htmlFor="gitHub">Github</Label>
                    <Input
                        id="gitHub"
                        type="text"
                        value={app.gitHub}
                        placeholder="Github"
                        onChange={handleInputChange}
                    />
                    <Label htmlFor="sourceCode">Source Code</Label>
                    <Input
                        id="sourceCode"
                        type="text"
                        value={app.sourceCode}
                        placeholder="Source Code"
                        onChange={handleInputChange}
                    />
                </>
            )}

            <Button onClick={() => updateApp(app)} type="button">
                Save
            </Button>

            <ActionDialog
                trigger={
                    <Button variant="destructiveOutline" type="button">
                        Factory Reset
                    </Button>
                }
                title="Anda Yakin Ingin Reset Aplikasi?"
                description="Aplikasi Akan Kembali Ke Pengaturan Awal"
                action={() => resetApp('stellaryst_db')}
            />
        </div>
    );
}
