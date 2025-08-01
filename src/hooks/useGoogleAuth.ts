import { env } from '@/lib/env';
import { id, init } from '@instantdb/react';
import { useState } from 'react';

const db = init({ appId: env.instantDbAppId });

type JWTResponse = {
    given_name: string;
    family_name: string;
    email: string;
    picture?: string;
    name: string;
};

function parseIdToken(idToken: string): JWTResponse {
    const base64Payload = idToken.split('.')[1];
    const decoded = atob(base64Payload);
    const parsed = JSON.parse(decoded);
    return parsed;
}

export function useGoogleOAuth() {
    const [nonce] = useState(() => crypto.randomUUID());

    const query = {
        profiles: {},
    };

    const { isLoading, data } = db.useQuery(query);

    const handleGoogleSuccess = async ({ credential }: { credential?: string }) => {
        try {
            if (!credential) throw new Error('No credential received');

            const parsed = parseIdToken(credential);

            const { user } = await db.auth.signInWithIdToken({
                clientName: env.googleClientName,
                idToken: credential,
                nonce,
            });

            // Cek apakah user sudah ada berdasarkan userId, bukan entity id
            const profiles = data?.profiles ?? [];
            const existingUser = profiles.find((p) => p.userId === user.id);

            if (!existingUser) {
                await db.transact(
                    db.tx.profiles[id()].update({
                        userId: user.id,
                        firstName: parsed.given_name || '',
                        lastName: parsed.family_name || '',
                        fullName: parsed.name || '',
                        profilePicture: parsed.picture || '',
                        email: parsed.email || '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }),
                );
            }

            // lanjutkan ke home/dashboard jika perlu di sini
        } catch (err: any) {
            console.error('Error during login:', err);
            alert('Terjadi kesalahan saat login: ' + (err.message || 'Unknown error'));
        }
    };

    const handleGoogleError = () => {
        console.error('Google login failed');
        alert('Login Google gagal. Silakan coba lagi.');
    };

    return {
        nonce,
        isLoading,
        handleGoogleSuccess,
        handleGoogleError,
    };
}
