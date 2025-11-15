import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import StatsPage from './pages/StatsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import { NAV_LINKS } from './constants';
import { MenuIcon, XIcon, LogoIcon, ChevronDownIcon } from './constants';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
    const location = useLocation();
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setIsOpen(false);
        setMobileSubmenuOpen(null);
    }, [location]);

    const handleMouseEnter = (name: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setOpenDropdown(name);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = window.setTimeout(() => {
            setOpenDropdown(null);
        }, 100);
    };
    
    const toggleMobileSubmenu = (name: string) => {
        setMobileSubmenuOpen(prev => (prev === name ? null : name));
    }

    return (
        <header className="bg-primary-light/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <NavLink to="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <LogoIcon />
                        <span className="text-2xl font-poppins font-bold text-text-dark group-hover:text-accent-blue transition-colors duration-200">SIGLON</span>
                    </NavLink>
                    <div className="hidden md:block">
                        <nav className="ml-10 flex items-baseline space-x-1">
                            {NAV_LINKS.map((link) =>
                                link.subLinks ? (
                                    <div key={link.name} className="relative" onMouseEnter={() => handleMouseEnter(link.name)} onMouseLeave={handleMouseLeave}>
                                        <button className={`px-3 py-2 rounded-md text-sm font-poppins font-medium flex items-center gap-1 transition-all duration-300 ${location.pathname.startsWith(link.path) ? 'bg-accent-blue text-white shadow-[0_0_10px_theme(colors.accent-blue)]' : 'text-text-muted hover:bg-gray-200 hover:text-text-dark'}`}>
                                            {link.name}
                                            <ChevronDownIcon />
                                        </button>
                                        {openDropdown === link.name && (
                                            <div className="absolute top-full mt-2 w-56 rounded-xl shadow-lg bg-secondary-light ring-1 ring-black ring-opacity-5 py-2 z-10 animate-fade-in-down origin-top-right">
                                                {link.subLinks.map(subLink => (
                                                    <NavLink
                                                        key={subLink.name}
                                                        to={subLink.path}
                                                        className={({ isActive }) => `block px-4 py-2 text-sm font-poppins ${isActive ? 'text-accent-blue' : 'text-text-muted'} hover:bg-gray-100 hover:text-text-dark`}
                                                    >
                                                        {subLink.name}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `px-3 py-2 rounded-md text-sm font-poppins font-medium transition-all duration-300 ${isActive ? 'bg-accent-blue text-white shadow-[0_0_10px_theme(colors.accent-blue)]' : 'text-text-muted hover:bg-gray-200 hover:text-text-dark'}`
                                        }
                                    >
                                        {link.name}
                                    </NavLink>
                                )
                            )}
                        </nav>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-text-dark hover:bg-accent-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-primary-light focus:ring-accent-blue"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <XIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {NAV_LINKS.map((link) =>
                            link.subLinks ? (
                                <div key={link.name}>
                                    <button onClick={() => toggleMobileSubmenu(link.name)} className={`w-full text-left flex justify-between items-center px-3 py-2 rounded-md text-base font-poppins font-medium transition-colors duration-200 ${location.pathname.startsWith(link.path) ? 'bg-accent-blue text-white' : 'text-text-muted hover:bg-gray-200 hover:text-text-dark'}`}>
                                       <span>{link.name}</span>
                                       <ChevronDownIcon className={`transition-transform duration-200 ${mobileSubmenuOpen === link.name ? 'rotate-180' : ''}`} />
                                    </button>
                                    {mobileSubmenuOpen === link.name && (
                                        <div className="pl-5 mt-1 space-y-1">
                                            {link.subLinks.map(subLink => (
                                                 <NavLink
                                                    key={subLink.name}
                                                    to={subLink.path}
                                                    className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-poppins font-medium transition-colors duration-200 ${isActive ? 'bg-accent-blue/80 text-white' : 'text-text-muted hover:bg-gray-200 hover:text-text-dark'}`}
                                                 >
                                                    {subLink.name}
                                                 </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `block px-3 py-2 rounded-md text-base font-poppins font-medium transition-colors duration-200 ${isActive ? 'bg-accent-blue text-white' : 'text-text-muted hover:bg-gray-200 hover:text-text-dark'}`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            )
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};


const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-soft border-t border-gray-200">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <LogoIcon />
                            <h3 className="text-xl font-poppins font-bold text-text-dark">SIGLON</h3>
                        </div>
                        <p className="text-sm text-text-muted max-w-xs">Mengenal, Mencegah, dan Memantau Tanah Longsor di Indonesia.</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-poppins font-semibold text-text-dark uppercase tracking-wider">Navigasi</h3>
                        <ul className="mt-4 space-y-2">
                            {NAV_LINKS.map((link) => (
                                <li key={`footer-${link.name}`}>
                                    <NavLink to={link.path} className="text-base text-text-muted hover:text-accent-blue transition-colors duration-200">
                                        {link.name}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                         <h3 className="text-sm font-poppins font-semibold text-text-dark uppercase tracking-wider">Sumber Data</h3>
                         <p className="mt-4 text-base text-text-muted">Data kejadian bencana bersumber dari Data Informasi Bencana Indonesia (DIBI) yang dikelola oleh Badan Nasional Penanggulangan Bencana (BNPB).</p>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-300 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} SIGLON. Semua hak dilindungi.</p>
                </div>
            </div>
        </footer>
    );
};


const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/peta" element={<MapPage />} />
                        <Route path="/statistik" element={<StatsPage />} />
                        <Route path="/pengetahuan" element={<KnowledgeBasePage />} />
                        <Route path="/tentang" element={<AboutPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        {/* A detail page would be better, but we cannot create new files.
                        <Route path="/berita/:id" element={<NewsDetailPage />} /> 
                        */}
                    </Routes>
                </main>
                <Footer />
            </div>
        </HashRouter>
    );
};

export default App;
