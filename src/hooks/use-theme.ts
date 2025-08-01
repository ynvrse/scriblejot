import { useTheme } from "next-themes";

export const useThemeMode = () => {
    const { setTheme, theme } = useTheme();

    return {
        toggle: () => setTheme(theme === "light" ? "dark" : "light"),
        themeMode: theme
    }
}
