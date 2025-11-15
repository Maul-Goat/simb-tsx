import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { newsData } from '../data/database';
import { NewsArticle } from '../types';
import { Pagination } from './HomePage';
import { XIcon } from '../constants';


type Tab = 'Berita' | 'Pengetahuan' | 'Longsor';

const PageHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <div className="bg-secondary-light py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-poppins font-bold text-text-dark">{title}</h1>
            <p className="mt-2 text-lg text-text-muted">{subtitle}</p>
        </div>
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-poppins font-medium rounded-t-lg border-b-2 transition-colors duration-200 focus:outline-none ${
            active
                ? 'border-accent-blue text-accent-blue'
                : 'border-transparent text-text-muted hover:text-text-dark'
        }`}
    >
        {children}
    </button>
);

const NewsDetailModal: React.FC<{ article: NewsArticle; onClose: () => void }> = ({ article, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-secondary-light rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 bg-white/50 backdrop-blur-sm rounded-full p-2">
                    <XIcon />
                </button>
                <img className="w-full h-64 object-cover rounded-t-2xl" src={article.image} alt={article.title} />
                <div className="p-8">
                    <p className="text-sm text-accent-blue font-semibold uppercase">{article.category}</p>
                    <h2 className="text-3xl font-poppins font-bold text-text-dark mt-2">{article.title}</h2>
                    <p className="text-sm text-text-muted mt-2">{article.date}</p>
                    <div className="prose max-w-none mt-6 text-text-muted">
                        <p>{article.content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewsSection: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
    const articlesPerPage = 6;
    const totalPages = Math.ceil(newsData.length / articlesPerPage);
    const currentArticles = newsData.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

    const handleReadMore = (id: number) => {
        const article = newsData.find(a => a.id === id);
        if (article) setSelectedNews(article);
    };

    const handleCloseModal = () => {
        setSelectedNews(null);
    };

    return (
        <>
            {selectedNews && <NewsDetailModal article={selectedNews} onClose={handleCloseModal} />}
            <div className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentArticles.map(article => (
                        <div key={article.id} className="bg-secondary-light rounded-2xl overflow-hidden shadow-lg border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300 flex flex-col group">
                            <img className="h-48 w-full object-cover" src={article.image} alt={article.title} />
                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-xs text-accent-blue font-semibold uppercase">{article.category}</p>
                                <h3 className="mt-2 text-lg font-poppins font-semibold text-text-dark flex-grow">{article.title}</h3>
                                <p className="mt-2 text-sm text-text-muted line-clamp-3">{article.summary}</p>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">{article.date}</span>
                                    <button onClick={() => handleReadMore(article.id)} className="text-sm font-poppins font-medium text-accent-blue hover:underline">Baca Selengkapnya</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </>
    );
};

const InfoBox: React.FC<{ title: string, borderColor: string, children: React.ReactNode }> = ({ title, borderColor, children }) => (
    <div className={`bg-secondary-light border-l-4 ${borderColor} p-6 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition transform hover:-translate-y-1 duration-300`}>
        <h3 className="text-xl font-poppins font-semibold text-text-dark mb-2">{title}</h3>
        <div className="text-text-muted leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

const KnowledgeSection: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoBox title="Definisi Bencana" borderColor="border-green-info">
            <p>Bencana adalah peristiwa atau rangkaian peristiwa yang mengancam dan mengganggu kehidupan dan penghidupan masyarakat yang disebabkan, baik oleh faktor alam dan/atau faktor nonalam maupun faktor manusia sehingga mengakibatkan timbulnya korban jiwa, kerusakan lingkungan, dan kerugian harta benda. (UU No. 24 Tahun 2007)</p>
        </InfoBox>
        <InfoBox title="Potensi Ancaman di Indonesia" borderColor="border-orange-warning">
             <p>Indonesia terletak pada pertemuan tiga lempeng tektonik utama dunia, menjadikannya salah satu negara paling rawan bencana dengan potensi ancaman seperti gempa bumi, tsunami, letusan gunung api, banjir, dan tanah longsor.</p>
        </InfoBox>
        <div className="md:col-span-2">
            <img src="https://picsum.photos/seed/mapindo/1200/400" alt="Peta Ancaman Bencana Indonesia" className="rounded-lg shadow-lg w-full object-cover h-64 border border-gray-200" />
        </div>
    </div>
);

const LandslideSection: React.FC = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <InfoBox title="Apa itu Tanah Longsor?" borderColor="border-green-info">
            <p>Tanah longsor merupakan salah satu jenis gerakan massa tanah atau batuan, menuruni atau keluar lereng akibat terganggunya kestabilan tanah atau batuan penyusun lereng.</p>
        </InfoBox>
        <InfoBox title="Penyebab & Pemicu" borderColor="border-orange-warning">
            <ul className="list-disc list-inside text-sm">
                <li>Curah Hujan Tinggi</li>
                <li>Lereng Terjal</li>
                <li>Jenis Tanah Rentan</li>
                <li>Getaran (Gempa, dll)</li>
                <li>Aktivitas Manusia</li>
            </ul>
        </InfoBox>
        <InfoBox title="Upaya Mitigasi & Pencegahan" borderColor="border-accent-blue">
             <ul className="list-disc list-inside text-sm">
                <li>Tanam vegetasi penahan lereng</li>
                <li>Buat terasering (sengkedan)</li>
                <li>Perbaiki sistem drainase</li>
                <li>Hindari membangun di area rawan</li>
                <li>Waspada tanda-tanda awal</li>
            </ul>
        </InfoBox>
    </div>
);


const KnowledgeBasePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Longsor');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const hash = location.hash.substring(1); // remove #
        switch (hash) {
            case 'berita':
                setActiveTab('Berita');
                break;
            case 'pengetahuan':
                setActiveTab('Pengetahuan');
                break;
            case 'longsor':
            default:
                setActiveTab('Longsor');
                break;
        }
    }, [location.hash]);

    return (
        <div className="bg-primary-light min-h-screen">
            <PageHeader title="Pusat Pengetahuan" subtitle="Informasi komprehensif mengenai berita, kebencanaan, dan mitigasi tanah longsor." />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <TabButton active={activeTab === 'Longsor'} onClick={() => navigate('/pengetahuan#longsor')}>Info Tanah Longsor</TabButton>
                        <TabButton active={activeTab === 'Pengetahuan'} onClick={() => navigate('/pengetahuan#pengetahuan')}>Pengetahuan Bencana</TabButton>
                        <TabButton active={activeTab === 'Berita'} onClick={() => navigate('/pengetahuan#berita')}>Berita</TabButton>
                    </nav>
                </div>

                <div className="transition-opacity duration-300">
                    {activeTab === 'Longsor' && <LandslideSection />}
                    {activeTab === 'Pengetahuan' && <KnowledgeSection />}
                    {activeTab === 'Berita' && <NewsSection />}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBasePage;
