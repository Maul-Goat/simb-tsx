import React, { useState, useEffect, useCallback } from 'react';
import { getNewsData, getDetailedLandslideData, getKnowledgeData, deleteBerita, deleteKejadian, deleteMateri, addBerita, addOfficialLandslide, addMateri } from '../data/database';
import { NewsArticle, DetailedLandslideEvent, KnowledgeArticle } from '../types';

type Tab = 'berita' | 'kejadian' | 'materi';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-poppins font-medium rounded-md transition-colors duration-200 focus:outline-none ${
            active
                ? 'bg-accent-blue text-white shadow-md'
                : 'bg-gray-200 text-text-muted hover:bg-gray-300 hover:text-text-dark'
        }`}
    >
        {children}
    </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="bg-secondary-light p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 mt-8">
        <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-dark">{title}</h2>
        {children}
    </section>
);


const BeritaManager: React.FC = () => {
    const [data, setData] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form state
    const [judul, setJudul] = useState('');
    const [isi, setIsi] = useState('');
    const [gambar, setGambar] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            setData(await getNewsData());
        } catch (error) {
            console.error(error);
            alert('Gagal memuat data berita.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus berita ini?')) {
            const success = await deleteBerita(id);
            if (success) {
                alert('Berita berhasil dihapus.');
                fetchData();
            } else {
                alert('Gagal menghapus berita.');
            }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addBerita({ judul, isi, gambar, tanggal });
            alert('Berita berhasil ditambahkan!');
            setJudul('');
            setIsi('');
            setGambar('');
            setTanggal(new Date().toISOString().slice(0, 10));
            fetchData();
        } catch (error) {
            alert('Gagal menambahkan berita.');
        }
    };

    return (
        <div>
            <Section title="Tambah Berita Baru">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required className="w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm" />
                    <input type="text" value={judul} onChange={e => setJudul(e.target.value)} required placeholder="Judul Berita" className="md:col-span-2 w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm" />
                    <textarea value={isi} onChange={e => setIsi(e.target.value)} required placeholder="Isi Berita" rows={4} className="md:col-span-2 w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm"></textarea>
                    <input type="url" value={gambar} onChange={e => setGambar(e.target.value)} placeholder="URL Gambar (opsional)" className="md:col-span-2 w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm" />
                    <button type="submit" className="md:col-span-2 w-full bg-accent-blue text-white font-semibold py-2 rounded-lg hover:bg-accent-blue-hover">Tambah Berita</button>
                </form>
            </Section>
            <Section title="Data Berita Tersimpan">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table header and body */}
                        <thead className="bg-gray-soft">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Judul</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Tanggal</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={3} className="p-4 text-center">Memuat...</td></tr>) : 
                             data.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm">{item.title}</td>
                                    <td className="px-4 py-2 text-sm">{item.date}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    );
};


const KejadianManager: React.FC = () => {
    const [data, setData] = useState<DetailedLandslideEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const formState = {
        lokasi: useState(''),
        coordinates: useState(''),
        tanggal: useState(new Date().toISOString().slice(0, 10)),
        korban_meninggal: useState(0),
        korban_luka: useState(0),
        rumah_rusak: useState(0),
    };
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            setData(await getDetailedLandslideData());
        } catch (error) {
            console.error(error);
            alert('Gagal memuat data kejadian.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus data kejadian ini?')) {
            const success = await deleteKejadian(id);
            if (success) {
                alert('Data kejadian berhasil dihapus.');
                fetchData();
            } else {
                alert('Gagal menghapus data kejadian.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const [coordsStr, setCoordsStr] = formState.coordinates;
             if (!coordsStr.includes(',')) {
                alert('Format Koordinat harus "latitude, longitude"');
                return;
            }
            const coordsArray = coordsStr.split(',').map(coord => parseFloat(coord.trim()));
            if (coordsArray.length !== 2 || isNaN(coordsArray[0]) || isNaN(coordsArray[1])) {
                alert('Koordinat tidak valid.');
                return;
            }

            await addOfficialLandslide({
                lokasi: formState.lokasi[0],
                tanggal: formState.tanggal[0],
                korban_meninggal: formState.korban_meninggal[0],
                korban_luka: formState.korban_luka[0],
                kerusakan_rumah: formState.rumah_rusak[0],
                coordinates: [coordsArray[0], coordsArray[1]]
            });
            
            alert('Data kejadian berhasil ditambahkan!');
            Object.values(formState).forEach(([, setter], index) => {
                if(index === 2) (setter as Function)(new Date().toISOString().slice(0,10)); // date
                else if (index > 2) (setter as Function)(0); // numbers
                else (setter as Function)(''); // strings
            });

            fetchData();
        } catch (err) {
            alert('Gagal menambahkan data.');
            console.error(err);
        }
    };
    
    return (
        <div>
            <Section title="Tambah Kejadian Bencana Resmi">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="date" value={formState.tanggal[0]} onChange={e => formState.tanggal[1](e.target.value)} required className="w-full bg-primary-light border p-2 rounded-md text-sm" />
                    <input type="text" value={formState.lokasi[0]} onChange={e => formState.lokasi[1](e.target.value)} required placeholder="Nama Lokasi, Contoh: Kab. Bogor, Jawa Barat" className="w-full bg-primary-light border p-2 rounded-md text-sm" />
                    <input type="text" value={formState.coordinates[0]} onChange={e => formState.coordinates[1](e.target.value)} required placeholder="Koordinat, Contoh: -6.59, 106.8" className="w-full bg-primary-light border p-2 rounded-md text-sm" />
                    <input type="number" min="0" value={formState.rumah_rusak[0]} onChange={e => formState.rumah_rusak[1](parseInt(e.target.value))} required placeholder="Rumah Rusak" className="w-full bg-primary-light border p-2 rounded-md text-sm" />
                    <input type="number" min="0" value={formState.korban_meninggal[0]} onChange={e => formState.korban_meninggal[1](parseInt(e.target.value))} required placeholder="Korban Meninggal" className="w-full bg-primary-light border p-2 rounded-md text-sm" />
                    <input type="number" min="0" value={formState.korban_luka[0]} onChange={e => formState.korban_luka[1](parseInt(e.target.value))} required placeholder="Korban Luka" className="w-full bg-primary-light border p-2 rounded-md text-sm" />
                    <button type="submit" className="md:col-span-2 w-full bg-accent-blue text-white font-semibold py-2 rounded-lg hover:bg-accent-blue-hover">Tambah Kejadian</button>
                </form>
            </Section>
            <Section title="Data Kejadian Tersimpan">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-soft">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Lokasi</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Tanggal</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Meninggal</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Aksi</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={4} className="p-4 text-center">Memuat...</td></tr>) : 
                             data.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm">{item.lokasi}</td>
                                    <td className="px-4 py-2 text-sm">{new Date(item.tanggalKejadian).toLocaleDateString('id-ID')}</td>
                                    <td className="px-4 py-2 text-sm text-center">{item.meninggal}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    )
};

const MateriManager: React.FC = () => {
    const [data, setData] = useState<KnowledgeArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [kategori, setKategori] = useState<'pengertian' | 'penyebab' | 'penanggulangan' | 'mitigasi' | 'informasi umum'>('pengertian');
    const [judul, setJudul] = useState('');
    const [isi, setIsi] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            setData(await getKnowledgeData());
        } catch (error) {
            console.error(error);
            alert('Gagal memuat data materi.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus materi ini?')) {
            const success = await deleteMateri(id);
            if (success) {
                alert('Materi berhasil dihapus.');
                fetchData();
            } else {
                alert('Gagal menghapus materi.');
            }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addMateri({ kategori, judul, isi });
            alert('Materi berhasil ditambahkan!');
            setJudul('');
            setIsi('');
            fetchData();
        } catch (error) {
            alert('Gagal menambahkan materi.');
        }
    };

    return (
        <div>
            <Section title="Tambah Materi Edukasi Baru">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={kategori} onChange={e => setKategori(e.target.value as any)} className="w-full bg-primary-light border p-2 rounded-md text-sm">
                        <option value="pengertian">Pengertian</option>
                        <option value="penyebab">Penyebab</option>
                        <option value="penanggulangan">Penanggulangan</option>
                        <option value="mitigasi">Mitigasi</option>
                        <option value="informasi umum">Informasi Umum</option>
                    </select>
                    <input type="text" value={judul} onChange={e => setJudul(e.target.value)} required placeholder="Judul Materi" className="w-full bg-primary-light border p-2 rounded-md text-sm" />
                    <textarea value={isi} onChange={e => setIsi(e.target.value)} required placeholder="Isi Materi (HTML didukung)" rows={5} className="md:col-span-2 w-full bg-primary-light border p-2 rounded-md text-sm"></textarea>
                    <button type="submit" className="md:col-span-2 w-full bg-accent-blue text-white font-semibold py-2 rounded-lg hover:bg-accent-blue-hover">Tambah Materi</button>
                </form>
            </Section>
             <Section title="Data Materi Tersimpan">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-soft">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Judul</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Kategori</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Aksi</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={3} className="p-4 text-center">Memuat...</td></tr>) : 
                             data.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm">{item.title}</td>
                                    <td className="px-4 py-2 text-sm">{item.category}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    )
};

const DatabasePage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('berita');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Password salah!');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-gray-soft">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border">
                    <h2 className="text-2xl font-bold text-center font-poppins text-text-dark">Akses Manajemen Database</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="password-db" className="block text-sm font-medium text-text-dark mb-1">Password</label>
                            <input
                                id="password-db"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-primary-light border border-gray-300 rounded-md p-2.5 text-sm text-text-dark placeholder-gray-400 focus:ring-accent-blue focus:border-accent-blue"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="submit" className="w-full bg-accent-blue text-white font-poppins font-semibold py-2.5 rounded-lg hover:bg-accent-blue-hover transition-all duration-300">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary-light min-h-screen">
            <div className="bg-secondary-light py-12 border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-poppins font-bold text-text-dark">Manajemen Database</h1>
                    <p className="mt-2 text-lg text-text-muted">Kelola konten yang ditampilkan di seluruh aplikasi SIGLON.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex space-x-2 border-b border-gray-200 pb-4">
                    <TabButton active={activeTab === 'berita'} onClick={() => setActiveTab('berita')}>Berita</TabButton>
                    <TabButton active={activeTab === 'kejadian'} onClick={() => setActiveTab('kejadian')}>Kejadian Longsor</TabButton>
                    <TabButton active={activeTab === 'materi'} onClick={() => setActiveTab('materi')}>Materi Edukasi</TabButton>
                </div>
                
                <div className="mt-8">
                    {activeTab === 'berita' && <BeritaManager />}
                    {activeTab === 'kejadian' && <KejadianManager />}
                    {activeTab === 'materi' && <MateriManager />}
                </div>
            </div>
        </div>
    );
};

export default DatabasePage;
