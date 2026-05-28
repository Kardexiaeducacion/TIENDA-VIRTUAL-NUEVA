import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "secondary-fixed-dim": "#c7c6c6",
        "on-tertiary-container": "#838484",
        "tertiary-fixed-dim": "#c7c6c6",
        "surface-container": "#eeeeee",
        "tertiary-container": "#1a1c1c",
        "surface-variant": "#e2e2e2",
        "on-secondary-fixed-variant": "#464747",
        "on-secondary-container": "#626262",
        "primary-fixed": "#e2e2e2",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#1b1b1b",
        "inverse-primary": "#c6c6c6",
        "surface": "#f9f9f9",
        "surface-container-highest": "#e2e2e2",
        "background": "#f9f9f9",
        "on-primary-container": "#848484",
        "on-tertiary-fixed-variant": "#464747",
        "error": "#ba1a1a",
        "surface-dim": "#dadada",
        "on-background": "#1a1c1c",
        "secondary-fixed": "#e4e2e2",
        "on-tertiary-fixed": "#1a1c1c",
        "tertiary-fixed": "#e3e2e2",
        "primary-fixed-dim": "#c6c6c6",
        "on-secondary": "#ffffff",
        "primary-container": "#1b1b1b",
        "outline": "#7e7576",
        "inverse-surface": "#2f3131",
        "surface-tint": "#5e5e5e",
        "on-error": "#ffffff",
        "surface-container-low": "#f3f3f3",
        "on-surface": "#1a1c1c",
        "secondary": "#5e5e5e",
        "outline-variant": "#cfc4c5",
        "inverse-on-surface": "#f1f1f1",
        "tertiary": "#000000",
        "surface-bright": "#f9f9f9",
        "surface-container-high": "#e8e8e8",
        "on-secondary-fixed": "#1b1c1c",
        "error-container": "#ffdad6",
        "surface-container-lowest": "#ffffff",
        "on-surface-variant": "#4c4546",
        "on-error-container": "#93000a",
        "on-primary-fixed-variant": "#474747",
        "primary": "#000000",
        "on-tertiary": "#ffffff",
        "secondary-container": "#e1dfdf"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "stack-md": "24px",
        "stack-sm": "8px",
        "max-width": "1440px",
        "column-count": "12",
        "margin-desktop": "80px",
        "gutter-desktop": "32px",
        "stack-lg": "48px",
        "stack-xl": "80px"
      },
      fontFamily: {
        "display-xl": ["Manrope", "sans-serif"],
        "body-md": ["Manrope", "sans-serif"],
        "headline-md": ["Manrope", "sans-serif"],
        "display-lg": ["Manrope", "sans-serif"],
        "body-lg": ["Manrope", "sans-serif"],
        "label-md": ["Manrope", "sans-serif"],
        "label-sm": ["Manrope", "sans-serif"],
        "headline-lg": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "display-xl": ["80px", {"lineHeight": "88px", "letterSpacing": "-0.04em", "fontWeight": "800"}],
        "body-md": ["16px", {"lineHeight": "24px", "letterSpacing": "0", "fontWeight": "400"}],
        "headline-md": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "display-lg": ["64px", {"lineHeight": "72px", "letterSpacing": "-0.03em", "fontWeight": "700"}],
        "body-lg": ["20px", {"lineHeight": "32px", "letterSpacing": "0", "fontWeight": "400"}],
        "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500"}],
        "headline-lg": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
      }
    }
  }
} satisfies Config;
