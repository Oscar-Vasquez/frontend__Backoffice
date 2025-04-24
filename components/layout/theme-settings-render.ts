import { themeColors } from "@/store/themeSettingsStore";

export const themeSettingsRender = () => {
  return `(function() {
      const storagedTheme = JSON.parse(localStorage.getItem("settings-storage"))?.state;
      if(storagedTheme){
        const colors = ${JSON.stringify(themeColors)};
        document.documentElement.style.setProperty("--primary", colors[storagedTheme.themeColor] || "24 9.8% 10%");
        document.documentElement.style.setProperty("--radius", storagedTheme.roundedCorner + 'rem');

        if (storagedTheme.theme === 'dark') {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove('dark');
        }

        if (storagedTheme.direction === "rtl") {
          document.documentElement.setAttribute("dir", "rtl");
        } else {
          document.documentElement.setAttribute("dir", "ltr");
        }

        document.addEventListener('DOMContentLoaded', function() {
          if (storagedTheme.fontFamily) {
            const v = 'var(--font-' + storagedTheme.fontFamily + ')'
            document.body.style.setProperty("font-family", v);
          }
            
          if (storagedTheme.contentLayout === 'centered') {
            document.querySelector('main')?.classList.add("container", "mx-auto");
          }
        })
      } else {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDarkScheme) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove('dark');
        } 
      }
    })();`;
};
