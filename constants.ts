import React from 'react';

export const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'Peta', path: '/peta' },
    { name: 'Statistik', path: '/statistik' },
    { 
        name: 'Pengetahuan', 
        path: '/pengetahuan',
        subLinks: [
            { name: 'Info Tanah Longsor', path: '/pengetahuan#longsor' },
            { name: 'Pengetahuan Bencana', path: '/pengetahuan#pengetahuan' },
            { name: 'Berita', path: '/pengetahuan#berita' },
        ]
    },
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Admin', path: '/admin' },
];

// Icons
// FIX: Rewriting SVG components using React.createElement to avoid JSX parsing errors in a .ts file.
export const MenuIcon: React.FC = () => (
    React.createElement('svg', {
        className: "h-6 w-6",
        stroke: "currentColor",
        fill: "none",
        viewBox: "0 0 24 24"
    }, 
        React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M4 6h16M4 12h16M4 18h16"
        })
    )
);

export const XIcon: React.FC = () => (
    React.createElement('svg', {
        className: "h-6 w-6",
        stroke: "currentColor",
        fill: "none",
        viewBox: "0 0 24 24"
    },
        React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M6 18L18 6M6 6l12 12"
        })
    )
);

export const LogoIcon: React.FC = () => (
    React.createElement('svg', {
        className: "h-8 w-8 text-accent-blue",
        fill: "currentColor",
        viewBox: "0 0 20 20"
    },
        React.createElement('path', {
            fillRule: "evenodd",
            d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.333 5.333a.667.667 0 10-1.333 0v1.334a.667.667 0 101.333 0V5.333zm-2 4.667a.667.667 0 01.667-.667h2.666a.667.667 0 110 1.333H8a.667.667 0 01-.667-.667zm.667 2.667a.667.667 0 100 1.333h4a.667.667 0 100-1.333H8z",
            clipRule: "evenodd"
        }),
        React.createElement('path', {
            d: "M11.96 4.34a1.5 1.5 0 010 2.12l-3.535 3.536a1.5 1.5 0 11-2.121-2.121L9.84 4.34a1.5 1.5 0 012.12 0z"
        })
    )
);

export const ChevronLeftIcon: React.FC = () => (
    React.createElement('svg', {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-5 w-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor"
    },
        React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M15 19l-7-7 7-7"
        })
    )
);

export const ChevronRightIcon: React.FC = () => (
    React.createElement('svg', {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-5 w-5",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor"
    },
        React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M9 5l7 7-7 7"
        })
    )
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    className: className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  },
    React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M19 9l-7 7-7-7"
    })
  )
);
