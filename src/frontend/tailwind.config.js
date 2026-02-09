import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                stone: {
                    50: 'oklch(98% 0.01 60)',
                    100: 'oklch(96% 0.01 60)',
                    200: 'oklch(92% 0.01 60)',
                    300: 'oklch(88% 0.01 60)',
                    400: 'oklch(75% 0.02 60)',
                    500: 'oklch(60% 0.02 60)',
                    600: 'oklch(50% 0.01 60)',
                    700: 'oklch(40% 0.01 60)',
                    800: 'oklch(32% 0.01 60)',
                    900: 'oklch(25% 0.01 60)',
                    950: 'oklch(18% 0.01 60)',
                },
                emerald: {
                    50: 'oklch(96% 0.06 155)',
                    100: 'oklch(92% 0.08 155)',
                    200: 'oklch(86% 0.10 155)',
                    300: 'oklch(78% 0.12 155)',
                    400: 'oklch(70% 0.14 155)',
                    500: 'oklch(65% 0.16 155)',
                    600: 'oklch(58% 0.16 155)',
                    700: 'oklch(50% 0.14 155)',
                    800: 'oklch(42% 0.12 155)',
                    900: 'oklch(35% 0.10 155)',
                    950: 'oklch(25% 0.08 155)',
                },
                amber: {
                    50: 'oklch(96% 0.06 70)',
                    100: 'oklch(92% 0.08 70)',
                    200: 'oklch(86% 0.10 70)',
                    300: 'oklch(78% 0.12 70)',
                    400: 'oklch(72% 0.14 70)',
                    500: 'oklch(68% 0.14 70)',
                    600: 'oklch(62% 0.14 70)',
                    700: 'oklch(55% 0.12 70)',
                    800: 'oklch(48% 0.10 70)',
                    900: 'oklch(40% 0.08 70)',
                    950: 'oklch(30% 0.06 70)',
                },
                red: {
                    50: 'oklch(96% 0.06 25)',
                    100: 'oklch(92% 0.08 25)',
                    200: 'oklch(86% 0.12 25)',
                    300: 'oklch(78% 0.16 25)',
                    400: 'oklch(70% 0.20 25)',
                    500: 'oklch(64% 0.22 25)',
                    600: 'oklch(58% 0.22 25)',
                    700: 'oklch(50% 0.20 25)',
                    800: 'oklch(42% 0.16 25)',
                    900: 'oklch(35% 0.12 25)',
                    950: 'oklch(25% 0.08 25)',
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)'
            },
            fontFamily: {
                sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                rounded: ['ui-rounded', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif']
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
