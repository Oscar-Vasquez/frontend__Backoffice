import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  future: {
    disableColorOpacityUtilitiesByDefault: true,
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-hover": "hsl(var(--sidebar-accent-hover))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          "accent-foreground-hover": "hsl(var(--sidebar-accent-foreground-hover))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "gradient-xy": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "0% 0%"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "100% 100%"
          }
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0)"
          },
          "50%": {
            transform: "translateY(-10px)"
          }
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
            "animation-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"
          },
          "50%": {
            transform: "translateY(-12px) scale(1.05)",
            "animation-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"
          }
        },
        "scan": {
          "0%": {
            transform: "translateY(-2px) rotate(0deg)",
            opacity: "0.5"
          },
          "50%": {
            transform: "translateY(2px) rotate(180deg)",
            opacity: "1"
          },
          "100%": {
            transform: "translateY(-2px) rotate(360deg)",
            opacity: "0.5"
          }
        },
        "scanner-line": {
          "0%": {
            transform: "translateY(-100%)",
            opacity: "0"
          },
          "50%": {
            transform: "translateY(0)",
            opacity: "1"
          },
          "100%": {
            transform: "translateY(100%)",
            opacity: "0"
          }
        },
        "scanner": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0"
          },
          "50%": {
            transform: "translateX(0)",
            opacity: "1"
          },
          "100%": {
            transform: "translateX(100%)",
            opacity: "0"
          }
        },
        "scanner-slow": {
          "0%": {
            transform: "translateY(-100%)",
            opacity: "0"
          },
          "15%": {
            opacity: "0.7"
          },
          "35%, 65%": {
            transform: "translateY(0)",
            opacity: "1"
          },
          "85%": {
            opacity: "0.7"
          },
          "100%": {
            transform: "translateY(100%)",
            opacity: "0"
          }
        },
        "scanner-x-slow": {
          "0%": {
            transform: "translateX(-100%) scale(1.2)",
            opacity: "0"
          },
          "15%": {
            opacity: "0.7"
          },
          "35%, 65%": {
            transform: "translateX(0) scale(1)",
            opacity: "1"
          },
          "85%": {
            opacity: "0.7"
          },
          "100%": {
            transform: "translateX(100%) scale(1.2)",
            opacity: "0"
          }
        },
        "progress-infinite": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0.6"
          },
          "50%": {
            transform: "translateX(0%)",
            opacity: "1"
          },
          "100%": {
            transform: "translateX(100%)",
            opacity: "0.6"
          }
        },
        "ping-slow": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0.9"
          },
          "50%": {
            transform: "scale(1.1)",
            opacity: "0.6"
          },
          "100%": {
            transform: "scale(1.2)",
            opacity: "0.3"
          }
        },
        "pulse-slow": {
          "0%, 100%": {
            opacity: "0.9",
            transform: "scale(1)"
          },
          "50%": {
            opacity: "0.6",
            transform: "scale(0.95)"
          }
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-xy": "gradient-xy 15s ease infinite",
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "scan": "scan 3s ease-in-out infinite",
        "scanner-line": "scanner-line 2s ease-in-out infinite",
        "scanner": "scanner 2s ease-in-out infinite",
        "scanner-slow": "scanner-slow 6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "scanner-x-slow": "scanner-x-slow 8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "progress-infinite": "progress-infinite 4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "ping-slow": "ping-slow 4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "spin-slow": "spin-slow 3s linear infinite"
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addBase }) {
      addBase({
        html: { fontSize: ".938rem" }
      });
    })
  ]
} satisfies Config;

export default config;
