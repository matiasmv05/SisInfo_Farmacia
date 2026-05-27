import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#ffffff",
        "tertiary": "#511ea3",
        "secondary-fixed": "#83fc8e",
        "on-primary-fixed-variant": "#004491",
        "on-tertiary-container": "#dbc6ff",
        "surface-container-low": "#f3f4f5",
        "secondary": "#006e25",
        "on-secondary-container": "#007327",
        "on-primary-container": "#bbd0ff",
        "surface-dim": "#d9dadb",
        "error": "#ba1a1a",
        "secondary-fixed-dim": "#66df75",
        "inverse-on-surface": "#f0f1f2",
        "surface-variant": "#e1e3e4",
        "on-error": "#ffffff",
        "surface-container-highest": "#e1e3e4",
        "surface": "#f8f9fa",
        "inverse-primary": "#acc7ff",
        "secondary-container": "#80f98b",
        "on-secondary-fixed-variant": "#00531a",
        "on-primary-fixed": "#001a40",
        "surface-container": "#edeeef",
        "primary-container": "#0056b3",
        "on-tertiary": "#ffffff",
        "outline-variant": "#c2c6d4",
        "primary-fixed": "#d7e2ff",
        "surface-container-high": "#e7e8e9",
        "surface-bright": "#f8f9fa",
        "primary-fixed-dim": "#acc7ff",
        "on-primary": "#ffffff",
        "outline": "#727784",
        "on-secondary": "#ffffff",
        "on-tertiary-fixed-variant": "#5726a8",
        "background": "#f8f9fa",
        "tertiary-container": "#6a3cbb",
        "on-secondary-fixed": "#002106",
        "primary": "#003f87",
        "error-container": "#ffdad6",
        "on-background": "#191c1d",
        "surface-tint": "#115cb9",
        "on-error-container": "#93000a",
        "on-surface-variant": "#424752",
        "tertiary-fixed-dim": "#d3bbff",
        "on-surface": "#191c1d",
        "on-tertiary-fixed": "#250059",
        "inverse-surface": "#2e3132",
        "tertiary-fixed": "#ebddff"
      },
      borderRadius: {
        "sm": "0.125rem",
        "DEFAULT": "0.25rem",
        "md": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "sidebar_width": "260px",
        "row_height_standard": "56px",
        "row_height_dense": "40px",
        "gutter": "16px",
        "unit": "4px",
        "container_padding": "24px"
      },
      fontFamily: {
        "body-sm": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "data-mono": ["Inter", "sans-serif"]
      },
      fontSize: {
        "body-sm": ["13px", { "lineHeight": "18px", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg": ["30px", { "lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "500" }],
        "data-mono": ["14px", { "lineHeight": "20px", "fontWeight": "500" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};

export default config;
