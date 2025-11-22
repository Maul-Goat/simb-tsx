import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
    getPendingUserReports, 
    approveUserReport, 
    rejectUserReport, 
    getNewsData,
    getDetailedLandslideData,
    getKnowledgeData,
    deleteBerita,
    deleteKejadian,
    deleteMateri,
    addBerita,
    uploadBeritaImage,
    addOfficialLandslide,
    addMateri
} from './DatabasePage';
import { UserReport, NewsArticle, DetailedLandslideEvent, KnowledgeArticle } from '../types';

type Tab = 'laporan' | 'berita' | 'kejadian' | 'materi';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-poppins font-medium rounded-md transition-colors duration-200 focus:outline-none ${
            active
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-gray-200 text-text-subtle hover:bg-gray-300 hover:text-text-main'
        }`}
    >
        {children}
    </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string; }> = ({ title, children, className }) => (
    <section className={`bg-background-secondary p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 ${className}`}>
        <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-main">{title}</h2>
        {children}
    </section>
);

const LaporanManager: React.FC = () => {
    const [pendingReports, setPendingReports] = useState<UserReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingReportId, setProcessingReportId] = useState<number | null>(null);

    const fetchPendingReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const reports = await getPendingUserReports();
            setPendingReports(reports);
        } catch (err) {
            console.error("Failed to fetch pending reports:", err);
            alert("Gagal memuat laporan.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingReports();
    }, [fetchPendingReports]);

    const handleApprove = async (id: number) => {
        if (processingReportId) return;
        if (window.confirm('Apakah Anda yakin ingin menyetujui laporan ini dan menambahkannya ke data resmi?')) {
            setProcessingReportId(id);
            try {
                const success = await approveUserReport(id);
                if(success) {
                    alert('Laporan berhasil disetujui.');
                    await fetchPendingReports();
                } else {
                    alert('Gagal menyetujui laporan. Laporan mungkin tidak ditemukan atau sudah diproses.');
                }
            } catch (err) {
                console.error("Error approving report:", err);
                alert('Terjadi kesalahan saat menyetujui laporan.');
            } finally {
                setProcessingReportId(null);
            }
        }
    };

    const handleReject = async (id: number) => {
        if (processingReportId) return;
        if (window.confirm('Apakah Anda yakin ingin menolak laporan ini?')) {
            setProcessingReportId(id);
             try {
                const success = await rejectUserReport(id);
                if(success) {
                    alert('Laporan berhasil ditolak.');
                    await fetchPendingReports();
                } else {
                    alert('Gagal menolak laporan. Laporan mungkin tidak ditemukan.');
                }
             } catch (err) {
                console.error("Error rejecting report:", err);
                alert('Terjadi kesalahan saat menolak laporan.');
             } finally {
                setProcessingReportId(null);
             }
        }
    };

    return (
        <Section title="Laporan Masyarakat (Pending)">
            {isLoading ? (
                 <p className="text-text-subtle">Memuat laporan...</p>
            ) : pendingReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingReports.map(report => {
                        const isProcessing = processingReportId === report.id;
                        return (
                        <div key={report.id} className="bg-background-primary/50 p-5 rounded-xl border flex flex-col justify-between">
                            <div>
                                <div className="font-semibold text-text-main font-poppins">{report.name}</div>
                                <div className="text-xs text-text-subtle mb-2">ID Laporan: {report.id}</div>
                                <p className="text-sm text-text-main my-2 break-words">&quot;{report.description}&quot;</p>
                                
                                <div className="text-xs text-text-subtle space-y-1 my-2">
                                    <div>Meninggal: <strong>{report.korbanMeninggal || 0}</strong></div>
                                    <div>Luka: <strong>{report.korbanLuka || 0}</strong></div>
                                    <div>Rumah Rusak: <strong>{report.rumahRusak || 0}</strong></div>
                                </div>

                                <a 
                                    href={`https://www.google.com/maps?q=${report.latlng[0]},${report.latlng[1]}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-brand-primary hover:underline"
                                >
                                    Lokasi: {report.latlng[0].toFixed(4)}, {report.latlng[1].toFixed(4)}
                                </a>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button 
                                    onClick={() => handleReject(report.id)} 
                                    disabled={isProcessing}
                                    className="px-3 py-1 text-xs font-semibold text-text-subtle bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isProcessing ? 'Memproses...' : 'Tolak'}
                                </button>
                                <button 
                                    onClick={() => handleApprove(report.id)} 
                                    disabled={isProcessing}
                                    className="px-3 py-1 text-xs font-semibold text-white bg-status-info hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isProcessing ? 'Memproses...' : 'Setujui'}
                                </button>
                            </div>
                        </div>
                    )})}
                </div>
            ) : (
                <p className="text-text-subtle">Tidak ada laporan yang menunggu peninjauan.</p>
            )}
        </Section>
    )
};

const BeritaManager: React.FC = () => {
    const [data, setData] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [judul, setJudul] = useState('');
    const [isi, setIsi] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [sumberUrl, setSumberUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try { setData(await getNewsData()); } 
        catch (error) { console.error(error); alert('Gagal memuat data berita.'); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus berita ini?')) {
            if (await deleteBerita(id)) { alert('Berita berhasil dihapus.'); fetchData(); } 
            else { alert('Gagal menghapus berita.'); }
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let imageUrl = 'https://picsum.photos/seed/news_default/600/400';
            if (imageFile) {
                const uploadedUrl = await uploadBeritaImage(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    throw new Error('Image upload failed to return a URL.');
                }
            }

            await addBerita({ judul, isi, gambar: imageUrl, tanggal, sumber_url: sumberUrl });
            alert('Berita berhasil ditambahkan!');
            
            setJudul(''); 
            setIsi(''); 
            setSumberUrl('');
            setImageFile(null);
            const fileInput = document.getElementById('gambar-berita') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            setTanggal(new Date().toISOString().slice(0, 10));

            fetchData();
        } catch (error) { 
            console.error(error);
            alert('Gagal menambahkan berita.'); 
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <Section title="Tambah Berita Baru">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label htmlFor="tanggal-berita" className="block text-sm font-medium text-text-main mb-1">Tanggal</label>
                             <input id="tanggal-berita" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div>
                             <label htmlFor="judul-berita" className="block text-sm font-medium text-text-main mb-1">Judul Berita</label>
                             <input id="judul-berita" type="text" value={judul} onChange={e => setJudul(e.target.value)} required placeholder="Judul Berita" className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="isi-berita" className="block text-sm font-medium text-text-main mb-1">Isi Berita</label>
                        <textarea id="isi-berita" value={isi} onChange={e => setIsi(e.target.value)} required placeholder="Isi Berita" rows={4} className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="gambar-berita" className="block text-sm font-medium text-text-main mb-1">Unggah Gambar</label>
                            <input id="gambar-berita" type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm text-text-subtle file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20" />
                        </div>
                        <div>
                            <label htmlFor="sumber-url-berita" className="block text-sm font-medium text-text-main mb-1">URL Sumber (opsional)</label>
                            <input id="sumber-url-berita" type="url" value={sumberUrl} onChange={e => setSumberUrl(e.target.value)} placeholder="https://contoh.com/berita-asli" className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                    </div>
                    <button type="submit" disabled={isUploading} className="w-full bg-brand-primary text-white font-semibold py-2.5 rounded-lg hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-wait">
                        {isUploading ? 'Mengunggah...' : 'Tambah Berita'}
                    </button>
                </form>
            </Section>
            <Section title="Data Berita Tersimpan" className="mt-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-background-tertiary"><tr><th className="px-4 py-2 text-left text-xs font-bold uppercase">Judul</th><th className="px-4 py-2 text-left text-xs font-bold uppercase">Tanggal</th><th className="px-4 py-2 text-left text-xs font-bold uppercase">URL Sumber</th><th className="px-4 py-2 text-left text-xs font-bold uppercase">Aksi</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={4} className="p-4 text-center">Memuat...</td></tr>) : 
                             data.map(item => (<tr key={item.id}><td className="px-4 py-2 text-sm">{item.title}</td><td className="px-4 py-2 text-sm">{item.date}</td><td className="px-4 py-2 text-sm max-w-xs truncate"><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">{item.sourceUrl}</a></td><td className="px-4 py-2 text-sm"><button onClick={() => handleDelete(item.id)} className="text-status-warning hover:underline">Hapus</button></td></tr>))}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    );
};

const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const CoordinatePickerMap: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
    const [markerPos, setMarkerPos] = useState<L.LatLng | null>(null);
    const mapRef = useRef<L.Map>(null);

    const MapEventsHandler = () => {
        useMapEvents({
            click(e) {
                setMarkerPos(e.latlng);
                onChange(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
            },
        });
        return null;
    };

    useEffect(() => {
        if (value) {
            const coords = value.split(',').map(c => parseFloat(c.trim()));
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                const latlng = new L.LatLng(coords[0], coords[1]);
                setMarkerPos(latlng);
                if (mapRef.current) {
                    mapRef.current.flyTo(latlng, 10);
                }
            }
        }
    }, [value]);

    return (
        <div className="h-64 rounded-md overflow-hidden z-0">
            <MapContainer ref={mapRef} center={[-2.548926, 118.0148634]} zoom={5} style={{ height: '100%', width: '100%' }} worldCopyJump={true} minZoom={2}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <MapEventsHandler />
                {markerPos && <Marker position={markerPos} icon={greenIcon} />}
            </MapContainer>
        </div>
    );
};

const KejadianManager: React.FC = () => {
    const [data, setData] = useState<DetailedLandslideEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [lokasi, setLokasi] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
    const [korbanMeninggal, setKorbanMeninggal] = useState<number | ''>('');
    const [korbanLuka, setKorbanLuka] = useState<number | ''>('');
    const [rumahRusak, setRumahRusak] = useState<number | ''>('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try { setData(await getDetailedLandslideData()); } 
        catch (error) { console.error(error); alert('Gagal memuat data kejadian.'); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus data kejadian ini?')) {
            if (await deleteKejadian(id)) { alert('Data kejadian berhasil dihapus.'); fetchData(); } 
            else { alert('Gagal menghapus data kejadian.'); }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!coordinates.includes(',')) { alert('Format Koordinat harus "latitude, longitude"'); return; }
            const coordsArray = coordinates.split(',').map(coord => parseFloat(coord.trim()));
            if (coordsArray.length !== 2 || isNaN(coordsArray[0]) || isNaN(coordsArray[1])) { alert('Koordinat tidak valid.'); return; }

            await addOfficialLandslide({ 
                lokasi, 
                tanggal, 
                deskripsi,
                korban_meninggal: Number(korbanMeninggal) || 0, 
                korban_luka: Number(korbanLuka) || 0, 
                kerusakan_rumah: Number(rumahRusak) || 0, 
                coordinates: [coordsArray[0], coordsArray[1]] 
            });
            
            alert('Data kejadian berhasil ditambahkan!');
            setLokasi(''); setCoordinates(''); setTanggal(new Date().toISOString().slice(0,10));
            setDeskripsi('');
            setKorbanMeninggal(''); setKorbanLuka(''); setRumahRusak('');

            fetchData();
        } catch (err) { alert('Gagal menambahkan data.'); console.error(err); }
    };
    
    return (
        <div>
            <Section title="Tambah Kejadian Bencana Resmi">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tanggal-kejadian" className="block text-sm font-medium text-text-main mb-1">Tanggal Kejadian</label>
                            <input id="tanggal-kejadian" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required className="w-full bg-background-primary border p-2 rounded-md text-sm" />
                        </div>
                        <div>
                            <label htmlFor="lokasi-kejadian" className="block text-sm font-medium text-text-main mb-1">Nama Lokasi</label>
                            <input id="lokasi-kejadian" type="text" value={lokasi} onChange={e => setLokasi(e.target.value)} required placeholder="Contoh: Kab. Bogor, Jawa Barat" className="w-full bg-background-primary border p-2 rounded-md text-sm" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="koordinat-kejadian" className="block text-sm font-medium text-text-main mb-1">Koordinat (klik peta atau isi manual)</label>
                        <CoordinatePickerMap value={coordinates} onChange={setCoordinates} />
                        <input id="koordinat-kejadian" type="text" value={coordinates} onChange={e => setCoordinates(e.target.value)} required placeholder="Contoh: -6.59, 106.8" className="w-full bg-background-primary border p-2 rounded-md text-sm mt-2" />
                    </div>
                    <div>
                        <label htmlFor="deskripsi-kejadian" className="block text-sm font-medium text-text-main mb-1">Deskripsi Kejadian (opsional)</label>
                        <textarea 
                            id="deskripsi-kejadian" 
                            rows={3} 
                            value={deskripsi} 
                            onChange={e => setDeskripsi(e.target.value)} 
                            placeholder="Contoh: Longsor terjadi setelah hujan lebat selama 3 hari, menutup akses jalan utama."
                            className="w-full bg-background-primary border p-2 rounded-md text-sm" 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <label htmlFor="korban-meninggal" className="block text-sm font-medium text-text-main mb-1">Korban Meninggal</label>
                            <input id="korban-meninggal" type="number" min="0" value={korbanMeninggal} onChange={e => setKorbanMeninggal(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full bg-background-primary border p-2 rounded-md text-sm" />
                        </div>
                        <div>
                            <label htmlFor="korban-luka" className="block text-sm font-medium text-text-main mb-1">Korban Luka</label>
                            <input id="korban-luka" type="number" min="0" value={korbanLuka} onChange={e => setKorbanLuka(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full bg-background-primary border p-2 rounded-md text-sm" />
                        </div>
                        <div>
                            <label htmlFor="rumah-rusak" className="block text-sm font-medium text-text-main mb-1">Rumah Rusak</label>
                            <input id="rumah-rusak" type="number" min="0" value={rumahRusak} onChange={e => setRumahRusak(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full bg-background-primary border p-2 rounded-md text-sm" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-brand-primary text-white font-semibold py-2.5 rounded-lg hover:bg-brand-primary-hover mt-2 transition-colors">Tambah Kejadian</button>
                </form>
            </Section>
            <Section title="Data Kejadian Tersimpan" className="mt-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-background-tertiary">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Lokasi</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Deskripsi</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Tanggal</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Meninggal</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Luka</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Rumah Rusak</th>
                                <th className="px-4 py-2 text-left text-xs font-bold uppercase">Aksi</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={7} className="p-4 text-center">Memuat...</td></tr>) : 
                             data.map(item => (
                                 <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm">{item.lokasi}</td>
                                    <td className="px-4 py-2 text-sm max-w-xs truncate" title={item.deskripsi}>{item.deskripsi}</td>
                                    <td className="px-4 py-2 text-sm whitespace-nowrap">{new Date(item.tanggalKejadian).toLocaleDateString('id-ID')}</td>
                                    <td className="px-4 py-2 text-sm text-center">{item.meninggal}</td>
                                    <td className="px-4 py-2 text-sm text-center">{item.terluka}</td>
                                    <td className="px-4 py-2 text-sm text-center">{item.rumahRusak}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <button onClick={() => handleDelete(item.id)} className="text-status-warning hover:underline">Hapus</button>
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
        try { setData(await getKnowledgeData()); } 
        catch (error) { console.error(error); alert('Gagal memuat data materi.'); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus materi ini?')) {
            if (await deleteMateri(id)) { alert('Materi berhasil dihapus.'); fetchData(); } 
            else { alert('Gagal menghapus materi.'); }
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addMateri({ kategori, judul, isi });
            alert('Materi berhasil ditambahkan!');
            setJudul(''); setIsi('');
            fetchData();
        } catch (error) { alert('Gagal menambahkan materi.'); }
    };

    return (
        <div>
            <Section title="Tambah Materi Edukasi Baru">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={kategori} onChange={e => setKategori(e.target.value as any)} className="w-full bg-background-primary border p-2 rounded-md text-sm">
                        <option value="pengertian">Pengertian</option>
                        <option value="penyebab">Penyebab</option>
                        <option value="penanggulangan">Penanggulangan</option>
                        <option value="mitigasi">Mitigasi</option>
                        <option value="informasi umum">Informasi Umum</option>
                    </select>
                    <input type="text" value={judul} onChange={e => setJudul(e.target.value)} required placeholder="Judul Materi" className="w-full bg-background-primary border p-2 rounded-md text-sm" />
                    <textarea value={isi} onChange={e => setIsi(e.target.value)} required placeholder="Isi Materi (HTML didukung)" rows={5} className="md:col-span-2 w-full bg-background-primary border p-2 rounded-md text-sm"></textarea>
                    <button type="submit" className="md:col-span-2 w-full bg-brand-primary text-white font-semibold py-2 rounded-lg hover:bg-brand-primary-hover">Tambah Materi</button>
                </form>
            </Section>
             <Section title="Data Materi Tersimpan" className="mt-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-background-tertiary"><tr><th className="px-4 py-2 text-left text-xs font-bold uppercase">Judul</th><th className="px-4 py-2 text-left text-xs font-bold uppercase">Kategori</th><th className="px-4 py-2 text-left text-xs font-bold uppercase">Aksi</th></tr></thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (<tr><td colSpan={3} className="p-4 text-center">Memuat...</td></tr>) : 
                             data.map(item => (<tr key={item.id}><td className="px-4 py-2 text-sm">{item.title}</td><td className="px-4 py-2 text-sm">{item.category}</td><td className="px-4 py-2 text-sm"><button onClick={() => handleDelete(item.id)} className="text-status-warning hover:underline">Hapus</button></td></tr>))}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    )
};


const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('laporan');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded password check
        if (password === 'admin123') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Password salah!');
        }
    };
    
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-background-tertiary">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border">
                    <h2 className="text-2xl font-bold text-center font-poppins text-text-main">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="password-admin" className="block text-sm font-medium text-text-main mb-1">Password</label>
                            <input
                                id="password-admin"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background-primary border border-gray-300 rounded-md p-2.5 text-sm text-text-main placeholder-gray-400 focus:ring-brand-primary focus:border-brand-primary"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="submit" className="w-full bg-brand-primary text-white font-poppins font-semibold py-2.5 rounded-lg hover:bg-brand-primary-hover transition-all duration-300">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-primary min-h-screen">
            <div className="bg-background-secondary py-12 border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-poppins font-bold text-text-main">Dasbor Admin</h1>
                    <p className="mt-2 text-lg text-text-subtle">Kelola konten, data, dan laporan untuk seluruh aplikasi SIGLON.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="flex space-x-2 border-b border-gray-200 pb-4">
                    <TabButton active={activeTab === 'laporan'} onClick={() => setActiveTab('laporan')}>Laporan Pending</TabButton>
                    <TabButton active={activeTab === 'berita'} onClick={() => setActiveTab('berita')}>Kelola Berita</TabButton>
                    <TabButton active={activeTab === 'kejadian'} onClick={() => setActiveTab('kejadian')}>Kelola Kejadian</TabButton>
                    <TabButton active={activeTab === 'materi'} onClick={() => setActiveTab('materi')}>Kelola Materi</TabButton>
                </div>
                
                <div className="mt-8">
                    {activeTab === 'laporan' && <LaporanManager />}
                    {activeTab === 'berita' && <BeritaManager />}
                    {activeTab === 'kejadian' && <KejadianManager />}
                    {activeTab === 'materi' && <MateriManager />}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;