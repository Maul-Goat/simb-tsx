import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as SwiperPagination, Autoplay, EffectFade } from 'swiper/modules';

import { getNewsData, getOfficialLandslideData, getDetailedLandslideData } from './DatabasePage';
import { NewsArticle, LandslideFeatureCollection } from '../types';
import { XIcon } from '../constants';
import Pagination from '../components/Pagination';

const orangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const Section: React.FC<{ children: React.ReactNode; className?: string; title: string; subtitle?: string; }> = ({ children, className = '', title, subtitle }) => (
    <section className={`py-16 sm:py-24 ${className}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-poppins font-bold text-text-main sm:text-4xl">{title}</h2>
                {subtitle && <p className="mt-4 text-lg text-text-subtle max-w-3xl mx-auto">{subtitle}</p>}
            </div>
            {children}
        </div>
    </section>
);

const HeroCarousel: React.FC = () => {
    return (
        <div className="relative h-[50vh] min-h-[400px] text-white rounded-2xl overflow-hidden shadow-lg">
            <Swiper
                modules={[Navigation, SwiperPagination, Autoplay, EffectFade]}
                className="h-full"
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                loop={true}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                effect="fade"
                fadeEffect={{ crossFade: true }}
            >
                {[
                    { img: "https://picsum.photos/seed/hero1/1920/1080", title: "Pemantauan Real-Time", sub: "Data tanah longsor terkini dari sumber terpercaya di seluruh Indonesia." },
                    { img: "https://picsum.photos/seed/hero2/1920/1080", title: "Edukasi & Mitigasi", sub: "Pahami penyebab, jenis, dan cara pencegahan tanah longsor." },
                    { img: "https://picsum.photos/seed/hero3/1920/1080", title: "Statistik & Analisis", sub: "Visualisasi data kejadian, korban, dan wilayah terdampak." },
                ].map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.img})` }}></div>
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
                            <h1 className="text-4xl md:text-5xl font-poppins font-bold tracking-tight mb-4 animate-fade-in-down">{slide.title}</h1>
                            <p className="text-lg md:text-xl max-w-3xl text-gray-200 mb-8 animate-fade-in-up">{slide.sub}</p>
                            <Link to="/peta" className="bg-brand-primary text-white font-poppins font-medium uppercase tracking-wider px-8 py-3 rounded-lg hover:bg-brand-primary-hover transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_theme(colors.brand-primary)]">
                                Pelajari Lebih Lanjut
                            </Link>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
    const commonClasses = "bg-background-secondary rounded-2xl overflow-hidden shadow-lg border border-gray-200 transform hover:-translate-y-2 transition-transform duration-300 flex flex-col group";
    
    const cardContent = (
        <>
            <div className="overflow-hidden">
                <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={article.image} alt={article.title} />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-brand-primary font-semibold">{article.date}</p>
                <h3 className="mt-2 text-lg font-poppins font-semibold text-text-main flex-grow">{article.title}</h3>
                <p className="mt-2 text-sm text-text-subtle">{article.summary}</p>
                <div className="mt-4 text-sm font-poppins font-medium text-brand-primary group-hover:underline group-hover:text-brand-primary-hover transition-colors duration-200 text-left">Baca Selengkapnya</div>
            </div>
        </>
    );

    if (article.sourceUrl) {
        return (
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className={commonClasses}>
                {cardContent}
            </a>
        );
    }

    return (
        <Link to={`/berita/${article.id}`} className={commonClasses}>
            {cardContent}
        </Link>
    );
};

const WarningBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible) return null;

    return (
        <div className="bg-status-warning/10 border-l-4 border-status-warning text-status-warning p-4 rounded-r-lg mb-8" role="alert">
            <div className="flex">
                <div className="py-1"><svg className="fill-current h-6 w-6 text-status-warning mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8h2v2H9v-2z"/></svg></div>
                <div>
                    <p className="font-bold font-poppins">Peringatan Dini Cuaca Ekstrem</p>
                    <p className="text-sm">Waspada potensi hujan lebat yang dapat disertai kilat/petir dan angin kencang di sebagian besar wilayah Indonesia. Tingkatkan kesiapsiagaan terhadap potensi bencana hidrometeorologi seperti banjir dan tanah longsor.</p>
                </div>
                <button onClick={() => setIsVisible(false)} className="ml-auto flex-shrink-0 p-1"><XIcon /></button>
            </div>
        </div>
    )
}

const HomePage: React.FC = () => {
    const [newsData, setNewsData] = useState<NewsArticle[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [landslideData, setLandslideData] = useState<LandslideFeatureCollection | null>(null);
    const [stats, setStats] = useState({ totalKejadian: 0, korbanJiwa: 0, provinsiTerdampak: 0 });
    const [isLoadingMap, setIsLoadingMap] = useState(true);
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const indonesiaBounds: L.LatLngBoundsExpression = [[-11, 95], [6, 141]];

    useEffect(() => {
        const fetchMapData = async () => {
            setIsLoadingMap(true);
            try {
                const data = await getOfficialLandslideData(100);
                setLandslideData(data);
            } catch (error) {
                console.error("Failed to fetch landslide data:", error);
            } finally {
                setIsLoadingMap(false);
            }
        };

        const fetchNewsData = async () => {
            setIsLoadingNews(true);
            try {
                const data = await getNewsData();
                setNewsData(data);
            } catch (error) {
                console.error("Failed to fetch news data:", error);
            } finally {
                setIsLoadingNews(false);
            }
        };
        
        const fetchStatsData = async () => {
            setIsLoadingStats(true);
            try {
                const detailedData = await getDetailedLandslideData();
                const totalKejadian = detailedData.length;
                const korbanJiwa = detailedData.reduce((sum, event) => sum + event.meninggal, 0);
                const provinsiTerdampak = new Set(detailedData.map(event => event.provinsi)).size;
                setStats({ totalKejadian, korbanJiwa, provinsiTerdampak });
            } catch (error) {
                console.error("Failed to fetch stats data:", error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchMapData();
        fetchNewsData();
        fetchStatsData();
    }, []);

    const articlesPerPage = 3;
    const totalPages = Math.ceil(newsData.length / articlesPerPage);
    const currentArticles = newsData.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

    return (
        <div className="bg-background-primary">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WarningBanner />
                <HeroCarousel />
            </div>

            <Section title="Berita Terbaru" className="bg-background-tertiary">
                {isLoadingNews ? (
                    <div className="text-center text-text-subtle">Memuat berita...</div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentArticles.map(article => <NewsCard key={article.id} article={article} />)}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        <div className="text-center mt-8">
                            <Link 
                                to="/pengetahuan#berita" 
                                className="inline-block bg-brand-primary text-white font-poppins font-medium px-8 py-3 rounded-lg hover:bg-brand-primary-hover transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-primary/40"
                            >
                                Lihat Semua Berita
                            </Link>
                        </div>
                    </>
                )}
            </Section>
            
            <Section title="Peta Sebaran Longsor" subtitle="Pantau lokasi kejadian tanah longsor aktif di seluruh Indonesia berdasarkan data terbaru.">
                <div className="h-[500px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
                    {isLoadingMap ? (
                        <div className="flex items-center justify-center h-full bg-background-tertiary">
                            <p className="text-text-subtle">Memuat Peta...</p>
                        </div>
                    ) : (
                        <MapContainer 
                            center={[-2.548926, 118.0148634]} 
                            zoom={5} 
                            scrollWheelZoom={false} 
                            style={{ height: '100%', width: '100%', backgroundColor: '#FDFBF7' }} 
                            worldCopyJump={true} 
                            minZoom={5}
                            maxBounds={indonesiaBounds}
                            maxBoundsViscosity={1.0}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            {landslideData?.features.map(point => (
                                <Marker key={point.properties.id} position={[point.geometry.coordinates[1], point.geometry.coordinates[0]]} icon={orangeIcon}>
                                    <Popup>
                                        <div className="font-poppins">
                                            <h4 className="font-bold text-base mb-1">{point.properties.lokasi}</h4>
                                            <p className="text-xs">Tanggal: {point.properties.tanggal}</p>
                                            <p className="text-xs">Korban Jiwa: {point.properties.korban_meninggal}</p>
                                            {point.properties.deskripsi && <p className="text-xs mt-1"><strong>Deskripsi:</strong> {point.properties.deskripsi}</p>}
                                            <p className="text-xs font-semibold mt-1">Sumber: {point.properties.sumber}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>
            </Section>
            
            <Section title="Statistik Kejadian" className="bg-background-tertiary">
                {isLoadingStats ? (
                    <div className="text-center text-text-subtle">Memuat statistik...</div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-background-secondary p-8 rounded-2xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-status-highlight/20">
                        <h3 className="text-5xl font-poppins font-bold text-status-highlight">
                            <CountUp end={stats.totalKejadian} duration={3} enableScrollSpy />
                        </h3>
                        <p className="mt-2 text-lg text-text-subtle">Total Kejadian</p>
                    </div>
                     <div className="bg-background-secondary p-8 rounded-2xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-status-warning/20">
                        <h3 className="text-5xl font-poppins font-bold text-status-warning">
                             <CountUp end={stats.korbanJiwa} duration={3} enableScrollSpy />
                        </h3>
                        <p className="mt-2 text-lg text-text-subtle">Korban Jiwa</p>
                    </div>
                     <div className="bg-background-secondary p-8 rounded-2xl border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:shadow-status-highlight/20">
                        <h3 className="text-5xl font-poppins font-bold text-status-highlight">
                             <CountUp end={stats.provinsiTerdampak} duration={3} enableScrollSpy />
                        </h3>
                        <p className="mt-2 text-lg text-text-subtle">Provinsi Terdampak</p>
                    </div>
                </div>
                )}
            </Section>

            <Section title="Pengetahuan Mitigasi Bencana" subtitle="Tingkatkan pemahaman Anda untuk mengurangi risiko dan dampak dari bencana tanah longsor.">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     {[
                         { title: "Apa itu Tanah Longsor?", link: "/pengetahuan#longsor" },
                         { title: "Penyebab & Pemicu", link: "/pengetahuan#longsor" },
                         { title: "Pencegahan & Mitigasi", link: "/pengetahuan#longsor" },
                         { title: "Jenis-jenis Longsor", link: "/pengetahuan#longsor" },
                     ].map(item => (
                         <Link key={item.title} to={item.link} className="block p-8 bg-background-secondary rounded-2xl shadow-lg border border-gray-200 text-center transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-xl hover:shadow-brand-primary/20">
                             <h3 className="font-poppins font-semibold text-lg text-text-main">{item.title}</h3>
                         </Link>
                     ))}
                 </div>
            </Section>
        </div>
    );
};

export default HomePage;