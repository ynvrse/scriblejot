import { db } from './useInstantDb';

export const useUserProfile = () => {
    const { user, isLoading: authLoading, error } = db.useAuth();

    const { data, isLoading: queryLoading } = db.useQuery(
        user
            ? {
                  profiles: {
                      $: {
                          where: {
                              userId: user.id,
                          },
                      },
                  },
                  $files: {},
              }
            : null,
    );

    const profile = data?.profiles?.[0] ?? null;

    const avatar = profile?.profilePicture?.startsWith('https://lh3.googleusercontent.com')
        ? profile?.profilePicture
        : data?.$files?.find((file) => file.path === profile?.profilePicture)?.url;

    return {
        avatar,
        user,
        profile,
        isLoading: authLoading || queryLoading,
        error,
    };
};
