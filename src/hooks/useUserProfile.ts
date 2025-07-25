import db from './useIDB';

export const useUserProfile = () => {
    const { user, isLoading: authLoading, error } = db.useAuth();

    const { data, isLoading: queryLoading } = db.useQuery(
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

    const profile = data?.profiles?.[0] ?? null;

    return {
        user,

        profile,
        isLoading: authLoading || queryLoading,
        error,
    };
};
