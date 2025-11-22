import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { getNewsData, getKnowledgeData, getNewsArticleById } from './DatabasePage';
import { NewsArticle, KnowledgeArticle } from '../types';
import Pagination from '../components/Pagination';

type Tab = 'Berita' | 'Pengetahuan' | 'Longsor';

const PageHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <div className="bg-background-secondary py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-poppins font-bold text-text-main">{title}</h1>
            <p className="mt-2 text-lg text-text-subtle">{subtitle}</p>
        </div>
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-poppins font-medium rounded-t-lg border-b-2 transition-colors duration-200 focus:outline-none ${
            active
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-subtle hover:text-text-main'
        }`}
    >
        {children}
    </button>
);

const NewsArticleDetail: React.FC<{ articleId: string }> = ({ articleId }) => {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticle = async () => {
            setIsLoading(true);
            try {
                const id = parseInt(articleId, 10);
                if (isNaN(id)) {
                    setArticle(null);
                    return;
                }
                const data = await getNewsArticleById(id);
                setArticle(data);
            } catch (error) {
                console.error("Failed to fetch article details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchArticle();
    }, [articleId]);

    if (isLoading) {
        return <div className="text-center py-20">Memuat artikel...</div>;
    }

    if (!article) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold font-poppins">Artikel Tidak Ditemukan</h2>
                <p className="text-text-subtle mt-2">Artikel yang Anda cari mungkin telah dihapus atau tidak ada.</p>
                <button onClick={() => navigate('/pengetahuan#berita')} className="mt-6 bg-brand-primary text-white font-poppins font-medium px-6 py-2 rounded-lg hover:bg-brand-primary-hover">
                    Kembali ke Daftar Berita
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto bg-background-secondary rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <img className="w-full h-64 md:h-96 object-cover" src={article.image} alt={article.title} />
            <div className="p-6 sm:p-10">
                <p className="text-sm text-brand-primary font-semibold uppercase">{article.category}</p>
                <h1 className="text-3xl md:text-4xl font-poppins font-bold text-text-main mt-2">{article.title}</h1>
                <p className="text-sm text-text-subtle mt-4">{new Date(article.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div className="prose max-w-none mt-8 text-text-subtle leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
                
                {article.sourceUrl && (
                    <div className="mt-10 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-poppins font-semibold text-text-main">SUMBER BERITA</h3>
                        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-brand-primary hover:underline break-all">
                            {article.sourceUrl}
                        </a>
                    </div>
                )}
                 <div className="mt-8 pt-6 border-t border-gray-200">
                     <button onClick={() => navigate('/pengetahuan#berita')} className="text-brand-primary font-poppins font-medium hover:underline">
                        &larr; Kembali ke Semua Berita
                    </button>
                </div>
            </div>
        </div>
    );
};

const NewsSection: React.FC = () => {
    const [newsData, setNewsData] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 6;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getNewsData();
                setNewsData(data);
            } catch (error) {
                console.error("Failed to load news:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalPages = Math.ceil(newsData.length / articlesPerPage);
    const currentArticles = newsData.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);

    if (isLoading) {
        return <div className="text-center p-8">Memuat berita...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentArticles.map(article => {
                    const commonClasses = "bg-background-secondary rounded-2xl overflow-hidden shadow-lg border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300 flex flex-col group";
                    const cardContent = (
                        <>
                            <img className="h-48 w-full object-cover" src={article.image} alt={article.title} />
                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-xs text-brand-primary font-semibold uppercase">{article.category}</p>
                                <h3 className="mt-2 text-lg font-poppins font-semibold text-text-main flex-grow">{article.title}</h3>
                                <p className="mt-2 text-sm text-text-subtle line-clamp-3">{article.summary}</p>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">{article.date}</span>
                                    <span className="text-sm font-poppins font-medium text-brand-primary group-hover:underline">Baca Selengkapnya</span>
                                </div>
                            </div>
                        </>
                    );

                    if (article.sourceUrl) {
                        return (
                             <a href={article.sourceUrl} key={article.id} target="_blank" rel="noopener noreferrer" className={commonClasses}>
                                {cardContent}
                            </a>
                        );
                    }
                    
                    return (
                        <Link to={`/berita/${article.id}`} key={article.id} className={commonClasses}>
                           {cardContent}
                        </Link>
                    );
                })}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};

const InfoBox: React.FC<{ title: string, borderColor: string, children: React.ReactNode }> = ({ title, borderColor, children }) => (
    <div className={`bg-background-secondary border-l-4 ${borderColor} p-6 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition transform hover:-translate-y-1 duration-300`}>
        <h3 className="text-xl font-poppins font-semibold text-text-main mb-2">{title}</h3>
        <div className="text-text-subtle leading-relaxed space-y-4 prose" dangerouslySetInnerHTML={{ __html: children as string }} />
    </div>
);

const KnowledgeContent: React.FC<{ articles: KnowledgeArticle[] }> = ({ articles }) => {
    if (articles.length === 0) {
        return <div className="text-center p-8 text-text-subtle bg-background-secondary rounded-lg border">Tidak ada materi edukasi untuk kategori ini.</div>;
    }
    
    return (
        <div className="space-y-8">
            {articles.map(article => (
                <InfoBox key={article.id} title={article.title} borderColor="border-status-info">
                   {article.content}
                </InfoBox>
            ))}
        </div>
    );
};

const KnowledgeBasePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Longsor');
    const [allKnowledge, setAllKnowledge] = useState<KnowledgeArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const { id: articleId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Don't fetch knowledge data if we are showing an article
        if(articleId) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getKnowledgeData();
                setAllKnowledge(data);
            } catch (error) {
                console.error("Failed to fetch knowledge data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [articleId]);

    useEffect(() => {
        if (articleId) return; // Don't manage tabs on article detail page

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
    }, [location.hash, articleId]);

    // If an article ID is present in the URL, render the detail page
    if (articleId) {
        return (
            <div className="bg-background-primary min-h-screen">
                 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <NewsArticleDetail articleId={articleId} />
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8">Memuat informasi...</div>;
        }
    
        switch (activeTab) {
            case 'Longsor': {
                const articles = allKnowledge.filter(item => item.category === 'pengertian');
                return <KnowledgeContent articles={articles} />;
            }
            case 'Pengetahuan': {
                const pengetahuanCategories = ['penyebab', 'penanggulangan', 'mitigasi', 'informasi umum'];
                const articles = allKnowledge.filter(item => pengetahuanCategories.includes(item.category));
                return <KnowledgeContent articles={articles} />;
            }
            case 'Berita':
                return <NewsSection />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-background-primary min-h-screen">
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
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBasePage;