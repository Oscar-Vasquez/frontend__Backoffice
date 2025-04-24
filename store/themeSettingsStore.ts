import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
// import * as tailwindColors from "tailwindcss/colors"; // No longer needed here
// import { getHSLValue } from "@/lib/utils"; // Removed import

const includeColors = [
  "slate",
  "stone",
  "neutral",
  "gray",
  "sky",
  "amber",
  "lime",
  "emerald",
  "indigo",
  "purple",
  "fuchsia",
  "rose",
  "blue",
  "cyan",
  "teal",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "violet"
];

// Define themeColors as a static object.
// TODO: Replace these placeholder HSL values with the actual pre-calculated values!
export const themeColors = {
  slate: "215.3 13.8% 46.5%",   // Placeholder HSL
  stone: "30 5.6% 45.7%",     // Placeholder HSL
  neutral: "0 0% 45.1%",        // Placeholder HSL
  gray: "215.4 16.3% 46.9%",  // Placeholder HSL
  sky: "198.1 89.6% 53.1%",  // Placeholder HSL
  amber: "38.3 95.5% 53.5%", // Placeholder HSL
  lime: "83.7 80.5% 50%",    // Placeholder HSL
  emerald: "145.1 63.2% 49%",  // Placeholder HSL
  indigo: "225.9 78.9% 55.1%", // Placeholder HSL
  purple: "262.1 83.3% 57.8%", // Placeholder HSL
  fuchsia: "286.2 80% 58.4%",   // Placeholder HSL
  rose: "346.8 94.3% 57.8%",  // Placeholder HSL
  blue: "217.2 91.2% 59.8%",  // Placeholder HSL
  cyan: "188.2 91.2% 43.5%",  // Placeholder HSL
  teal: "166.2 75.1% 43.3%",  // Placeholder HSL
  green: "142.1 70.6% 45.3%", // Placeholder HSL
  yellow: "47.9 95.8% 53.1%", // Placeholder HSL
  orange: "24.6 95% 53.1%",    // Placeholder HSL
  red: "4 90.2% 58.2%",      // Placeholder HSL
  pink: "334.1 89.3% 57.8%",  // Placeholder HSL
  violet: "248.1 88.8% 59.8%" // Placeholder HSL
};

// Export the ThemeColor type
export type ThemeColor = keyof typeof themeColors;

export const themeSettings = {
  fontFamily: {
    inter: "Inter",
    roboto: "Roboto",
    montserrat: "Montserrat",
    poppins: "Poppins",
    "overpass-mono": "Overpass Mono"
  }
} as const;

export type FontFamily = keyof typeof themeSettings.fontFamily;
export type ThemeDirection = "ltr" | "rtl";
export type ContentLayout = "full" | "centered";

interface SettingsState {
  fontFamily: FontFamily;
  themeColor: ThemeColor | "default";
  layout: "vertical" | "horizontal";
  contentLayout: ContentLayout;
  direction: ThemeDirection;
  sidebarLayout: "default" | "rtl";
  contentContainer: boolean;
  roundedCorner: number;
  setThemeColor: (colorScheme: ThemeColor) => void;
  setContentLayout: (contentLayout: ContentLayout) => void;
  setFontFamily: (fontFamily: FontFamily) => void;
  setRoundedCorner: (rounded: number) => void;
  setDirection: (direction: ThemeDirection) => void;
  setContentContainer: (contentContainer: boolean) => void;
  resetTheme: () => void;
}

const themeSettingsStore: StateCreator<SettingsState> = (set) => ({
  fontFamily: "inter",
  themeColor: "default",
  layout: "vertical",
  contentLayout: "full",
  direction: "ltr",
  sidebarLayout: "default",
  contentContainer: false,
  roundedCorner: 0.5,
  setThemeColor: (themeColor) => set({ themeColor }),
  setContentLayout: (contentLayout) => set({ contentLayout }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setRoundedCorner: (roundedCorner) => set({ roundedCorner }),
  setDirection: (direction) => set({ direction }),
  setContentContainer: (contentContainer) => set({ contentContainer }),
  resetTheme: () =>
    set({
      layout: "vertical",
      contentLayout: "full",
      fontFamily: "inter",
      themeColor: "default",
      direction: "ltr",
      sidebarLayout: "default",
      roundedCorner: 0.5,
      contentContainer: false
    })
});

const useThemeSettingsStore = create(
  persist(themeSettingsStore, {
    name: "settings-storage"
  })
);

export default useThemeSettingsStore;
