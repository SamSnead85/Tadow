/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Obsidian - Premium Dark Palette
                obsidian: {
                    50: '#f7f7f8',
                    100: '#ededf0',
                    200: '#d8d8dd',
                    300: '#b5b5be',
                    400: '#8c8c99',
                    500: '#6e6e7a',
                    600: '#5a5a64',
                    700: '#4a4a52',
                    800: '#141418', // Primary dark
                    900: '#0c0c0f', // Deep dark
                    950: '#050507', // Near black
                },
                // Tadow Gold - Primary Brand Color (excitement + trust)
                tadow: {
                    50: '#fdf8ef',
                    100: '#f9efd9',
                    200: '#f2ddb2',
                    300: '#e9c580',
                    400: '#dea94d', // Bright gold
                    500: '#d4a857', // Primary gold
                    600: '#c08b3a', // Rich gold
                    700: '#9f6d2e',
                    800: '#82572a',
                    900: '#6b4826',
                },
                // Flame - Hot deals accent (excitement)
                flame: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c', // Hot orange
                    500: '#f97316', // Primary flame
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                // Trust - Success/savings (reliability)
                trust: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981', // Primary success
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                // Mint - Savings & Success Accent (legacy)
                mint: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981', // Primary accent
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                // Electric - AI & Tech Accent
                electric: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9', // AI highlight
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                // Legacy support
                verity: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                noir: {
                    50: '#f7f7f8',
                    100: '#ededf0',
                    200: '#d8d8dd',
                    300: '#b5b5be',
                    400: '#8c8c99',
                    500: '#6e6e7a',
                    600: '#5a5a64',
                    700: '#4a4a52',
                    800: '#141418',
                    900: '#0c0c0f',
                    950: '#050507',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
            },
            fontSize: {
                'display-2xl': ['5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
                'display-xl': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
                'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
                'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
                'display-sm': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
            },
            boxShadow: {
                'glass': '0 4px 24px rgba(0, 0, 0, 0.4)',
                'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
                'glow-gold': '0 0 40px rgba(212, 168, 87, 0.2)',
                'glow-flame': '0 0 40px rgba(249, 115, 22, 0.15)',
                'glow-mint': '0 0 40px rgba(16, 185, 129, 0.15)',
                'glow-electric': '0 0 40px rgba(14, 165, 233, 0.15)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
                'card-hover': '0 4px 20px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(0, 0, 0, 0.25)',
            },
            backdropBlur: {
                'glass': '16px',
                'glass-heavy': '32px',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
}
