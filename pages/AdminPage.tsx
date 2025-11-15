import React, { useState, useEffect } from 'react';
import { getPendingUserReports, approveUserReport, rejectUserReport, addOfficialLandslide } from '../data/database';
import { UserReport } from '../types';

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [pendingReports, setPendingReports] = useState<UserReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingReportId, setProcessingReportId] = useState<number | null>(null);

    // Form state for adding new official landslide
    const [newLocationName, setNewLocationName] = useState('');
    const [newCoordinates, setNewCoordinates] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newCasualties, setNewCasualties] = useState(0);
    const [newInjured, setNewInjured] = useState(0);
    const [newDamagedHomes, setNewDamagedHomes] = useState(0);
    
    const fetchPendingReports = async () => {
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
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchPendingReports();
        }
    }, [isAuthenticated]);

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
    
    const handleAddLandslide = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!newCoordinates.includes(',')) {
                alert('Format Koordinat harus "latitude, longitude"');
                return;
            }
            
            const coordsArray = newCoordinates.split(',').map(coord => parseFloat(coord.trim()));
            if (coordsArray.length !== 2 || isNaN(coordsArray[0]) || isNaN(coordsArray[1])) {
                alert('Koordinat tidak valid. Pastikan formatnya benar.');
                return;
            }

            await addOfficialLandslide({
                lokasi: newLocationName,
                tanggal: newDate,
                korban_meninggal: newCasualties,
                korban_luka: newInjured,
                kerusakan_rumah: newDamagedHomes,
                coordinates: [coordsArray[0], coordsArray[1]]
            });
            // Reset form
            setNewLocationName('');
            setNewCoordinates('');
            setNewDate('');
            setNewCasualties(0);
            setNewInjured(0);
            setNewDamagedHomes(0);
            alert('Data kejadian berhasil ditambahkan!');
        } catch(err) {
            alert('Gagal menambahkan data. Pastikan format koordinat benar.');
            console.error(err);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-gray-soft">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border">
                    <h2 className="text-2xl font-bold text-center font-poppins text-text-dark">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="password-admin" className="block text-sm font-medium text-text-dark mb-1">Password</label>
                            <input
                                id="password-admin"
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
                    <h1 className="text-4xl font-poppins font-bold text-text-dark">Dasbor Admin</h1>
                    <p className="mt-2 text-lg text-text-muted">Kelola laporan masyarakat dan data kejadian tanah longsor.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                {/* Pending Reports Section */}
                <section>
                    <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-dark">Laporan Masyarakat (Pending)</h2>
                    {isLoading ? (
                         <p className="text-text-muted bg-secondary-light p-6 rounded-lg border">Memuat laporan...</p>
                    ) : pendingReports.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingReports.map(report => {
                                const isProcessing = processingReportId === report.id;
                                return (
                                <div key={report.id} className="bg-secondary-light p-5 rounded-xl shadow-lg border flex flex-col justify-between">
                                    <div>
                                        <div className="font-semibold text-text-dark font-poppins">{report.name}</div>
                                        <div className="text-xs text-text-muted mb-2">ID Laporan: {report.id}</div>
                                        <p className="text-sm text-text-dark my-2 break-words">&quot;{report.description}&quot;</p>
                                        <a 
                                            href={`https://www.google.com/maps?q=${report.latlng[0]},${report.latlng[1]}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-accent-blue hover:underline"
                                        >
                                            Lokasi: {report.latlng[0].toFixed(4)}, {report.latlng[1].toFixed(4)}
                                        </a>
                                    </div>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <button 
                                            onClick={() => handleReject(report.id)} 
                                            disabled={isProcessing}
                                            className="px-3 py-1 text-xs font-semibold text-text-muted bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isProcessing ? 'Memproses...' : 'Tolak'}
                                        </button>
                                        <button 
                                            onClick={() => handleApprove(report.id)} 
                                            disabled={isProcessing}
                                            className="px-3 py-1 text-xs font-semibold text-white bg-green-info hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isProcessing ? 'Memproses...' : 'Setujui'}
                                        </button>
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : (
                        <p className="text-text-muted bg-secondary-light p-6 rounded-lg border">Tidak ada laporan yang menunggu peninjauan.</p>
                    )}
                </section>
                
                {/* Add New Landslide Section */}
                 <section className="bg-secondary-light p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-dark">Tambah Kejadian Bencana Resmi</h2>
                    <form onSubmit={handleAddLandslide} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="tanggal" className="block text-sm font-medium text-text-dark mb-1">Tanggal Kejadian</label>
                            <input type="date" id="tanggal" value={newDate} onChange={e => setNewDate(e.target.value)} required className="w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm focus:ring-accent-blue focus:border-accent-blue" />
                        </div>
                        <div>
                            <label htmlFor="lokasi-name" className="block text-sm font-medium text-text-dark mb-1">Nama Lokasi</label>
                            <input type="text" id="lokasi-name" value={newLocationName} onChange={e => setNewLocationName(e.target.value)} required placeholder="Contoh: Kab. Bogor, Jawa Barat" className="w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm focus:ring-accent-blue focus:border-accent-blue" />
                        </div>
                         <div>
                            <label htmlFor="coordinates" className="block text-sm font-medium text-text-dark mb-1">Koordinat (Latitude, Longitude)</label>
                            <input type="text" id="coordinates" value={newCoordinates} onChange={e => setNewCoordinates(e.target.value)} required placeholder="-6.59, 106.8" className="w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm focus:ring-accent-blue focus:border-accent-blue" />
                        </div>
                        <div>
                            <label htmlFor="kerusakanRumah" className="block text-sm font-medium text-text-dark mb-1">Rumah Rusak</label>
                            <input type="number" min="0" id="kerusakanRumah" value={newDamagedHomes} onChange={e => setNewDamagedHomes(parseInt(e.target.value, 10))} required className="w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm focus:ring-accent-blue focus:border-accent-blue" />
                        </div>
                        <div>
                            <label htmlFor="korbanMeninggal" className="block text-sm font-medium text-text-dark mb-1">Korban Meninggal</label>
                            <input type="number" min="0" id="korbanMeninggal" value={newCasualties} onChange={e => setNewCasualties(parseInt(e.target.value, 10))} required className="w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm focus:ring-accent-blue focus:border-accent-blue" />
                        </div>
                         <div>
                            <label htmlFor="korbanLuka" className="block text-sm font-medium text-text-dark mb-1">Korban Luka-Luka</label>
                            <input type="number" min="0" id="korbanLuka" value={newInjured} onChange={e => setNewInjured(parseInt(e.target.value, 10))} required className="w-full bg-primary-light border border-gray-300 rounded-md p-2 text-sm focus:ring-accent-blue focus:border-accent-blue" />
                        </div>
                        <div className="md:col-span-2 text-right">
                             <button type="submit" className="bg-accent-blue text-white font-poppins font-semibold py-2.5 px-6 rounded-lg hover:bg-accent-blue-hover transition-all duration-300">
                                Tambah Data
                            </button>
                        </div>
                    </form>
                 </section>
            </div>
        </div>
    );
};

export default AdminPage;