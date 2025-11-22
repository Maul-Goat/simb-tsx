import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getOfficialLandslideData, getPendingUserReports, addUserReport } from '../data/database';
import { LandslideFeatureCollection, UserReport } from '../types';

// Official Data Marker
const orangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// User Report Marker
const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Temporary marker for new report location
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const MapEvents: React.FC<{ onMapClick: (latlng: L.LatLng) => void }> = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};

// Component to handle map panning and popup opening when a table row is clicked
const MapInteractionController: React.FC<{
    selectedEventId: number | null;
    data: LandslideFeatureCollection | null;
    markerRefs: React.MutableRefObject<Record<number, L.Marker | null>>;
}> = ({ selectedEventId, data, markerRefs }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedEventId && data) {
            const event = data.features.find(f => f.properties.id === selectedEventId);
            if (event) {
                const [lng, lat] = event.geometry.coordinates;
                map.flyTo([lat, lng], 12, { animate: true, duration: 1 });
                setTimeout(() => {
                    markerRefs.current[selectedEventId]?.openPopup();
                }, 1000); // Delay to ensure popup opens after flyTo animation
            }
        }
    }, [selectedEventId, data, map, markerRefs]);
    return null;
};

const MapPage: React.FC = () => {
    const [officialData, setOfficialData] = useState<LandslideFeatureCollection | null>(null);
    const [pendingReports, setPendingReports] = useState<UserReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [newReportLocation, setNewReportLocation] = useState<L.LatLng | null>(null);
    const [reporterName, setReporterName] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportCasualties, setReportCasualties] = useState<number | ''>(0);
    const [reportInjured, setReportInjured] = useState<number | ''>(0);
    const [reportDamagedHomes, setReportDamagedHomes] = useState<number | ''>(0);

    const formRef = useRef<HTMLDivElement>(null);
    const markerRefs = useRef<Record<number, L.Marker | null>>({});
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [official, pending] = await Promise.all([
                getOfficialLandslideData(),
                getPendingUserReports()
            ]);
            setOfficialData(official);
            setPendingReports(pending);
        } catch (error) {
            console.error("Failed to fetch map data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleMapClick = (latlng: L.LatLng) => {
        setNewReportLocation(latlng);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    
    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newReportLocation && reporterName && reportDescription) {
            await addUserReport({
                latlng: [newReportLocation.lat, newReportLocation.lng],
                name: reporterName,
                description: reportDescription,
                korban_jiwa: Number(reportCasualties) || 0,
                korban_luka: Number(reportInjured) || 0,
                rumah_rusak: Number(reportDamagedHomes) || 0,
            });
            alert('Laporan berhasil dikirim! Terima kasih atas partisipasi Anda.');
            // Reset form
            setNewReportLocation(null);
            setReporterName('');
            setReportDescription('');
            setReportCasualties(0);
            setReportInjured(0);
            setReportDamagedHomes(0);
            // Refresh data on map
            await fetchData();
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
            {/* Map Section */}
            <div className="flex-grow h-1/2 lg:h-full relative">
                {isLoading && (
                    <div className="absolute inset-0 z-[1001] bg-white/70 flex items-center justify-center">
                        <p className="text-text-subtle text-lg">Memuat data peta...</p>
                    </div>
                )}
                <MapContainer center={[-2.548926, 118.0148634]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', backgroundColor: '#FDFBF7' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    
                    <MapEvents onMapClick={handleMapClick} />
                    <MapInteractionController selectedEventId={selectedEventId} data={officialData} markerRefs={markerRefs} />

                    {/* Official Data Markers */}
                    {officialData?.features.map(point => (
                        <Marker 
                            key={`official-${point.properties.id}`} 
                            position={[point.geometry.coordinates[1], point.geometry.coordinates[0]]} 
                            icon={orangeIcon}
                            // FIX: The ref callback should not return a value. Using a block body to ensure it returns void.
                            ref={(el) => { markerRefs.current[point.properties.id] = el; }}
                        >
                            <Popup>
                                <div className="font-poppins">
                                    <h4 className="font-bold text-base mb-1 text-brand-primary">{point.properties.lokasi}</h4>
                                    <p className="text-xs">Tanggal: {point.properties.tanggal}</p>
                                    <p className="text-xs">Korban Jiwa: {point.properties.korban_meninggal}</p>
                                    <p className="text-xs">Korban Luka: {point.properties.korban_luka}</p>
                                    <p className="text-xs">Rumah Rusak: {point.properties.kerusakan_rumah}</p>
                                    {point.properties.deskripsi && <p className="text-xs mt-1"><strong>Deskripsi:</strong> {point.properties.deskripsi}</p>}
                                    <p className="text-xs font-semibold mt-2">Sumber: {point.properties.sumber}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Pending User Report Markers */}
                    {pendingReports.map(report => (
                         <Marker key={`user-${report.id}`} position={report.latlng} icon={blueIcon}>
                             <Popup>
                                <div className="font-poppins">
                                    <h4 className="font-bold text-base mb-1 text-status-highlight">Laporan Potensi Longsor (Pending)</h4>
                                    <p className="text-xs"><strong>Pelapor:</strong> {report.name}</p>
                                    <p className="text-xs mt-1"><strong>Deskripsi:</strong> {report.description}</p>
                                    <p className="text-xs mt-1"><strong>Korban Jiwa:</strong> {report.korban_jiwa || 0}</p>
                                    <p className="text-xs mt-1"><strong>Korban Luka:</strong> {report.korban_luka || 0}</p>
                                    <p className="text-xs mt-1"><strong>Rumah Rusak:</strong> {report.rumah_rusak || 0}</p>
                                    <p className="text-xs font-semibold mt-2">Sumber: Laporan Masyarakat</p>
                                </div>
                            </Popup>
                         </Marker>
                    ))}

                    {/* New Report Temporary Marker */}
                    {newReportLocation && <Marker position={newReportLocation} icon={greenIcon} />}

                </MapContainer>
                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 z-[1000] bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                    <h4 className="font-poppins font-semibold text-sm mb-2 text-text-main">Legenda</h4>
                    <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-orange-500 rounded-full border border-gray-400"></div><span className="text-xs text-text-subtle">Data Resmi</span></div>
                    <div className="flex items-center space-x-2 mt-1"><div className="w-4 h-4 bg-blue-500 rounded-full border border-gray-400"></div><span className="text-xs text-text-subtle">Laporan (Pending)</span></div>
                     <div className="flex items-center space-x-2 mt-1"><div className="w-4 h-4 bg-green-500 rounded-full border border-gray-400"></div><span className="text-xs text-text-subtle">Lokasi Laporan Baru</span></div>
                </div>
            </div>

            {/* Side Panel Section */}
            <div ref={formRef} className="w-full lg:w-96 bg-background-secondary overflow-y-auto h-1/2 lg:h-full border-l border-gray-200 flex flex-col">
                {/* Reporting Form */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-poppins font-bold text-text-main">Laporkan Potensi Longsor</h2>
                    <p className="text-sm text-text-subtle mt-2 mb-6">Lihat potensi longsor? Klik lokasi pada peta lalu isi form di bawah ini.</p>
                    
                    <form onSubmit={handleSubmitReport} className="space-y-4">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-text-main mb-1">Lokasi (Latitude, Longitude)</label>
                            <input
                                type="text"
                                id="location"
                                value={newReportLocation ? `${newReportLocation.lat.toFixed(5)}, ${newReportLocation.lng.toFixed(5)}` : 'Klik pada peta untuk memilih lokasi'}
                                readOnly
                                className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm text-text-subtle placeholder-gray-400 cursor-not-allowed"
                            />
                        </div>
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-main mb-1">Nama Pelapor</label>
                            <input
                                type="text"
                                id="name"
                                value={reporterName}
                                onChange={(e) => setReporterName(e.target.value)}
                                required
                                className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm text-text-main placeholder-gray-400 focus:ring-brand-primary focus:border-brand-primary"
                            />
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-text-main mb-1">Deskripsi Kondisi</label>
                            <textarea
                                id="description"
                                rows={3}
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                                required
                                placeholder="Contoh: Terlihat retakan tanah di lereng setelah hujan deras."
                                className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm text-text-main placeholder-gray-400 focus:ring-brand-primary focus:border-brand-primary"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label htmlFor="casualties" className="block text-sm font-medium text-text-main mb-1">Korban Jiwa</label>
                                <input type="number" id="casualties" min="0" value={reportCasualties} onChange={(e) => setReportCasualties(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm text-text-main" />
                            </div>
                             <div>
                                <label htmlFor="injured" className="block text-sm font-medium text-text-main mb-1">Korban Luka</label>
                                <input type="number" id="injured" min="0" value={reportInjured} onChange={(e) => setReportInjured(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm text-text-main" />
                            </div>
                             <div>
                                <label htmlFor="damaged" className="block text-sm font-medium text-text-main mb-1">Rumah Rusak</label>
                                <input type="number" id="damaged" min="0" value={reportDamagedHomes} onChange={(e) => setReportDamagedHomes(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="w-full bg-background-primary border border-gray-300 rounded-md p-2 text-sm text-text-main" />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={!newReportLocation || !reporterName || !reportDescription}
                            className="w-full bg-brand-primary text-white font-poppins font-semibold py-2.5 rounded-lg hover:bg-brand-primary-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-lg hover:shadow-brand-primary/40"
                        >
                            Kirim Laporan
                        </button>
                    </form>
                </div>
                {/* Interactive Data Table */}
                <div className="p-6 flex-grow flex flex-col">
                    <h2 className="text-2xl font-poppins font-bold text-text-main">Data Kejadian Resmi</h2>
                    <p className="text-sm text-text-subtle mt-2 mb-4">Klik baris tabel untuk melihat lokasi di peta.</p>
                    <div className="flex-grow overflow-y-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-background-tertiary sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-poppins font-bold text-text-main uppercase tracking-wider">Lokasi</th>
                                    <th className="px-4 py-2 text-left text-xs font-poppins font-bold text-text-main uppercase tracking-wider">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {officialData?.features.map(point => (
                                    <tr 
                                        key={`table-${point.properties.id}`}
                                        onClick={() => setSelectedEventId(point.properties.id)}
                                        className={`cursor-pointer transition-colors duration-200 ${selectedEventId === point.properties.id ? 'bg-brand-primary/10' : 'hover:bg-background-tertiary'}`}
                                    >
                                        <td className="px-4 py-3 text-sm text-text-main">{point.properties.lokasi}</td>
                                        <td className="px-4 py-3 text-sm text-text-subtle whitespace-nowrap">{point.properties.tanggal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPage;