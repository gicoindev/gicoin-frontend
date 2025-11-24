/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./app/**/*.{js,ts,jsx,tsx}",
	  "./components/**/*.{js,ts,jsx,tsx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: "class",
	theme: {
	  extend: {
		colors: {
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		},
  
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
  
		fontFamily: {
		  sans: ["var(--font-inter)", "sans-serif"], // ✅ Inter jadi default font
		},
  
		// ✅ Tambahan animation utilities
		animation: {
		  glow: "glow 1s ease-in-out",
		  fadeIn: "fadeIn 0.3s ease-in-out",
		},
		keyframes: {
		  glow: {
			"0%, 100%": { opacity: 0.2, boxShadow: "0 0 15px rgba(34,197,94,0.5)" },
			"50%": { opacity: 0.6, boxShadow: "0 0 25px rgba(34,197,94,0.8)" },
		  },
		  fadeIn: {
			"0%": { opacity: 0 },
			"100%": { opacity: 1 },
		  },
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  };
  