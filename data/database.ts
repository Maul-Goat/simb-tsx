import { LandslideFeatureCollection, NewsArticle, UserReport, LandslideDataPoint, MonthlyStat, ProvinceStat, DetailedLandslideEvent } from '../types';

// --- IndexedDB Setup ---
const DB_NAME = 'SIGLON_DB';
const DB_VERSION = 1;
const STORES = {
    LANDSLIDES: 'official_landslides',
    REPORTS: 'user_reports',
};

// Initial data for seeding the database
const initialLandslideFeatures: LandslideDataPoint[] = [
    { "type": "Feature", "properties": { "id": 1, "lokasi": "Kab. Bogor, Jawa Barat", "tanggal": "2023-03-15", "korban_meninggal": 5, "korban_luka": 3, "kerusakan_rumah": 12, "sumber": "BNPB" }, "geometry": { "type": "Point", "coordinates": [106.8, -6.59] } },
    { "type": "Feature", "properties": { "id": 2, "lokasi": "Kab. Banjarnegara, Jawa Tengah", "tanggal": "2023-04-20", "korban_meninggal": 2, "korban_luka": 8, "kerusakan_rumah": 25, "sumber": "BNPB" }, "geometry": { "type": "Point", "coordinates": [109.69, -7.4] } },
    { "type": "Feature", "properties": { "id": 3, "lokasi": "Kab. Tana Toraja, Sulawesi Selatan", "tanggal": "2023-05-01", "korban_meninggal": 0, "korban_luka": 1, "kerusakan_rumah": 5, "sumber": "BNPB" }, "geometry": { "type": "Point", "coordinates": [119.86, -3.05] } },
    { "type": "Feature", "properties": { "id": 4, "lokasi": "Kab. Agam, Sumatera Barat", "tanggal": "2024-01-10", "korban_meninggal": 1, "korban_luka": 4, "kerusakan_rumah": 9, "sumber": "BNPB" }, "geometry": { "type": "Point", "coordinates": [100.16, -0.32] } },
    { "type": "Feature", "properties": { "id": 5, "lokasi": "Kab. Cianjur, Jawa Barat", "tanggal": "2024-02-22", "korban_meninggal": 3, "korban_luka": 10, "kerusakan_rumah": 30, "sumber": "BNPB" }, "geometry": { "type": "Point", "coordinates": [107.14, -6.82] } },
];

const initialUserReports: UserReport[] = [
    { id: 101, latlng: [-6.90, 107.60], name: 'Budi Santoso', description: 'Terlihat retakan tanah di tebing dekat pemukiman setelah hujan lebat semalam.', status: 'pending' },
    { id: 102, latlng: [-7.79, 110.36], name: 'Siti Aminah', description: 'Ada suara gemuruh dari bukit di belakang desa, air sungai juga menjadi keruh.', status: 'pending' },
];

let dbPromise: Promise<IDBDatabase>;

const initDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Database error:', request.error);
            reject('Error opening database');
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create Landslides Store
            if (!db.objectStoreNames.contains(STORES.LANDSLIDES)) {
                const landslideStore = db.createObjectStore(STORES.LANDSLIDES, { keyPath: 'properties.id' });
                initialLandslideFeatures.forEach(item => landslideStore.add(item));
            }

            // Create Reports Store
            if (!db.objectStoreNames.contains(STORES.REPORTS)) {
                const reportStore = db.createObjectStore(STORES.REPORTS, { keyPath: 'id' });
                 reportStore.createIndex('status', 'status', { unique: false });
                initialUserReports.forEach(item => reportStore.add(item));
            }
        };
    });
    return dbPromise;
};


// --- Data Access and Manipulation Functions (Now Async) ---

// GETTERS
export const getOfficialLandslideData = async (): Promise<LandslideFeatureCollection> => {
    const db = await initDB();
    const features: LandslideDataPoint[] = await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.LANDSLIDES, 'readonly');
        const store = transaction.objectStore(STORES.LANDSLIDES);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
    return { type: "FeatureCollection", features };
};

export const getPendingUserReports = async (): Promise<UserReport[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.REPORTS, 'readonly');
        const store = transaction.objectStore(STORES.REPORTS);
        const index = store.index('status');
        const request = index.getAll('pending');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

// SETTERS / MUTATIONS
export const addUserReport = async (report: Omit<UserReport, 'id' | 'status'>): Promise<UserReport> => {
    const db = await initDB();
    const newReport: UserReport = {
        ...report,
        id: Date.now(),
        status: 'pending'
    };
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORES.REPORTS, 'readwrite');
        const store = transaction.objectStore(STORES.REPORTS);
        const request = store.add(newReport);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => resolve();
    });
    return newReport;
};

interface NewLandslideAdminData {
    lokasi: string;
    tanggal: string;
    korban_meninggal: number;
    korban_luka: number;
    kerusakan_rumah: number;
    coordinates: [number, number]; // [lat, lng]
}

export const addOfficialLandslide = async (data: NewLandslideAdminData): Promise<LandslideDataPoint> => {
    const db = await initDB();
    const allLandslides: LandslideDataPoint[] = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.LANDSLIDES, 'readonly');
        const store = tx.objectStore(STORES.LANDSLIDES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    const newId = allLandslides.length > 0 ? Math.max(...allLandslides.map(f => f.properties.id)) + 1 : 1;
    
    const newLandslide: LandslideDataPoint = {
        type: "Feature",
        properties: { id: newId, ...data, sumber: 'Admin Input', },
        geometry: { type: "Point", coordinates: [data.coordinates[1], data.coordinates[0]] }
    };
    
    await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORES.LANDSLIDES, 'readwrite');
        const store = transaction.objectStore(STORES.LANDSLIDES);
        const request = store.add(newLandslide);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => resolve();
    });
    return newLandslide;
};


export const approveUserReport = async (reportId: number): Promise<boolean> => {
    const db = await initDB();
    const transaction = db.transaction([STORES.REPORTS, STORES.LANDSLIDES], 'readwrite');
    const reportsStore = transaction.objectStore(STORES.REPORTS);
    
    const report: UserReport = await new Promise((resolve, reject) => {
        const request = reportsStore.get(reportId);
        request.onerror = reject;
        request.onsuccess = () => resolve(request.result);
    });

    if (!report || report.status !== 'pending') return false;

    report.status = 'approved';
    await new Promise((resolve, reject) => {
        const request = reportsStore.put(report);
        request.onerror = reject;
        request.onsuccess = resolve;
    });

    // Create a new official data point
    const allLandslides: LandslideDataPoint[] = await new Promise((res, rej) => {
        const req = transaction.objectStore(STORES.LANDSLIDES).getAll();
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
    });
    const newId = allLandslides.length > 0 ? Math.max(...allLandslides.map(f => f.properties.id)) + 1 : 1;
    
    const newLandslide: LandslideDataPoint = {
        type: "Feature",
        properties: {
            id: newId,
            lokasi: `Laporan dari ${report.name}`,
            tanggal: new Date().toISOString().split('T')[0],
            korban_meninggal: 0, korban_luka: 0, kerusakan_rumah: 0,
            sumber: `Laporan Masyarakat (${report.name})`
        },
        geometry: { type: "Point", coordinates: [report.latlng[1], report.latlng[0]] }
    };
    
    await new Promise((resolve, reject) => {
        const request = transaction.objectStore(STORES.LANDSLIDES).add(newLandslide);
        request.onerror = reject;
        request.onsuccess = resolve;
    });
    
    return true;
};

export const rejectUserReport = async (reportId: number): Promise<boolean> => {
    const db = await initDB();
    const transaction = db.transaction(STORES.REPORTS, 'readwrite');
    const store = transaction.objectStore(STORES.REPORTS);
    
    const report: UserReport = await new Promise((resolve, reject) => {
        const request = store.get(reportId);
        request.onerror = reject;
        request.onsuccess = () => resolve(request.result);
    });

    if (!report) return false;
    
    report.status = 'rejected';
     await new Promise((resolve, reject) => {
        const request = store.put(report);
        request.onerror = reject;
        request.onsuccess = resolve;
    });

    return true;
};


// --- Static Data (unchanged) ---
export const newsData: NewsArticle[] = [
    { id: 1, title: "BNPB: Waspada Potensi Longsor di Musim Hujan", summary: "Badan Nasional Penanggulangan Bencana (BNPB) mengimbau masyarakat untuk meningkatkan kewaspadaan...", date: "2024-07-15", category: "Peringatan Dini", image: "https://picsum.photos/seed/news1/600/400", content: "Kepala BNPB, Letjen TNI Suharyanto, S.Sos., M.M., menekankan pentingnya kesiapsiagaan menghadapi puncak musim hujan yang diperkirakan terjadi pada bulan Januari hingga Februari. 'Kami meminta seluruh BPBD di daerah rawan untuk mengaktifkan posko siaga dan menyosialisasikan langkah-langkah mitigasi kepada warga,' ujarnya dalam konferensi pers. Beberapa langkah yang dianjurkan antara lain adalah memeriksa kondisi lereng, membersihkan saluran drainase, dan mengenali tanda-tanda awal longsor seperti munculnya retakan tanah dan mata air baru." },
    { id: 2, title: "Teknologi Pemetaan Laser (LiDAR) untuk Mitigasi Longsor", summary: "Pemanfaatan teknologi LiDAR dinilai efektif untuk memetakan area rawan longsor dengan akurasi tinggi...", date: "2024-07-12", category: "Teknologi", image: "https://picsum.photos/seed/news2/600/400", content: "Teknologi Light Detection and Ranging (LiDAR) memungkinkan pembuatan model topografi tiga dimensi (3D) dengan resolusi sangat tinggi. Data ini sangat berharga untuk menganalisis kestabilan lereng dan mensimulasikan jalur aliran longsor. 'Dengan peta risiko yang akurat dari LiDAR, pemerintah daerah dapat merencanakan tata ruang yang lebih aman dan menentukan jalur evakuasi yang efektif,' jelas Dr. Rahmat, seorang ahli geologi dari ITB. Penggunaan drone yang dilengkapi sensor LiDAR juga mempercepat proses pemetaan di area yang sulit dijangkau." },
    { id: 3, title: "Relawan Lokal Jadi Ujung Tombak Penanganan Longsor", summary: "Peran serta masyarakat dan relawan lokal sangat krusial dalam respons cepat dan penanganan awal...", date: "2024-07-10", category: "Komunitas", image: "https://picsum.photos/seed/news3/600/400", content: "Saat bencana terjadi, seringkali relawan dari komunitas lokal adalah yang pertama kali tiba di lokasi. Pengetahuan mereka tentang medan dan kondisi sosial masyarakat setempat tidak ternilai. Program Desa Tangguh Bencana (DESTANA) dari BNPB berfokus pada pelatihan relawan-relawan ini, membekali mereka dengan keterampilan pertolongan pertama, manajemen posko, dan asesmen cepat. 'Mereka adalah pahlawan sesungguhnya, bekerja tanpa pamrih untuk menyelamatkan tetangga mereka,' kata seorang koordinator relawan." },
    { id: 4, title: "Pentingnya Vegetasi Vetiver untuk Mencegah Erosi", summary: "Penanaman rumput vetiver (akar wangi) terbukti mampu menahan erosi tanah dan menjadi solusi bioteknologi...", date: "2024-07-08", category: "Edukasi", image: "https://picsum.photos/seed/news4/600/400", content: "Sistem perakaran rumput vetiver yang dalam dan lebat (mencapai 3-4 meter) mampu mengikat partikel tanah secara efektif, sehingga meningkatkan daya tahan lereng terhadap erosi air hujan. Program penanaman vetiver secara masif di daerah hulu sungai dan lereng-lereng kritis menjadi salah satu solusi mitigasi vegetatif yang murah dan ramah lingkungan. Selain mencegah longsor, vetiver juga membantu menjaga kualitas air dan dapat dimanfaatkan untuk kerajinan tangan." },
    { id: 5, title: "Studi Kasus: Rekonstruksi Pasca-Longsor Banjarnegara", summary: "Belajar dari pengalaman, program rekonstruksi di Banjarnegara kini memprioritaskan relokasi...", date: "2024-07-05", category: "Studi Kasus", image: "https://picsum.photos/seed/news5/600/400", content: "Setelah bencana longsor besar di Banjarnegara beberapa tahun lalu, pemerintah mengadopsi pendekatan 'build back better'. Program rekonstruksi tidak hanya membangun kembali rumah yang rusak, tetapi juga memindahkannya ke lokasi yang lebih aman (zona relokasi). Rumah-rumah baru dibangun dengan desain tahan gempa dan memperhatikan kondisi topografi setempat. Proses ini melibatkan partisipasi aktif dari warga terdampak untuk memastikan hunian baru sesuai dengan kebutuhan sosial dan budaya mereka." },
    { id: 6, title: "Sistem Peringatan Dini Sederhana Berbasis Komunitas", summary: "Inovasi sistem peringatan dini (EWS) sederhana yang dikembangkan oleh warga menjadi contoh...", date: "2024-07-01", category: "Inovasi", image: "https://picsum.photos/seed/news6/600/400", content: "Di beberapa desa di Jawa Barat, warga secara swadaya mengembangkan EWS sederhana menggunakan alat-alat seperti ekstensometer manual dari kawat dan pendulum. Ketika terjadi pergerakan tanah yang signifikan, alat ini akan memicu alarm (seperti kentongan atau sirine) untuk memberi tahu warga agar segera mengungsi. Inovasi ini menunjukkan bahwa teknologi tidak harus mahal untuk menjadi efektif. Kuncinya adalah pemahaman risiko dan kemauan komunitas untuk bertindak bersama." },
];
export const monthlyStats2023: MonthlyStat[] = [ { name: 'Jan', kejadian: 45 }, { name: 'Feb', kejadian: 52 }, { name: 'Mar', kejadian: 60 }, { name: 'Apr', kejadian: 48 }, { name: 'Mei', kejadian: 35 }, { name: 'Jun', kejadian: 22 }, { name: 'Jul', kejadian: 18 }, { name: 'Agu', kejadian: 25 }, { name: 'Sep', kejadian: 30 }, { name: 'Okt', kejadian: 41 }, { name: 'Nov', kejadian: 55 }, { name: 'Des', kejadian: 62 }, ];
export const monthlyStats2024: MonthlyStat[] = [ { name: 'Jan', kejadian: 65 }, { name: 'Feb', kejadian: 58 }, { name: 'Mar', kejadian: 50 }, { name: 'Apr', kejadian: 45 }, { name: 'Mei', kejadian: 38 }, { name: 'Jun', kejadian: 28 }, { name: 'Jul', kejadian: 20 }, ];
export const provinceDistribution: ProvinceStat[] = [ { name: 'Jawa Barat', value: 120 }, { name: 'Jawa Tengah', value: 95 }, { name: 'Sumatera Barat', value: 70 }, { name: 'Sulawesi Selatan', value: 65 }, { name: 'Jawa Timur', value: 50 }, { name: 'Lainnya', value: 150 }, ];
export const detailedLandslideData: DetailedLandslideEvent[] = [
    { no: 1, idKabupaten: "3305", tanggalKejadian: "2025-10-29", kejadian: "TANAH LONGSOR", lokasi: "Kec. Buayan, Kab. Kebumen", provinsi: "Jawa Tengah", meninggal: 1, hilang: 0, terluka: 0, rumahRusak: 0, rumahTerendam: 0, fasumRusak: 0 },
    { no: 2, idKabupaten: "3202", tanggalKejadian: "2025-10-27", kejadian: "TANAH LONGSOR", lokasi: "Kec. Cisolok, Kab. Sukabumi", provinsi: "Jawa Barat", meninggal: 0, hilang: 0, terluka: 0, rumahRusak: 17, rumahTerendam: 0, fasumRusak: 0 },
    { no: 3, idKabupaten: "3201", tanggalKejadian: "2025-10-27", kejadian: "TANAH LONGSOR", lokasi: "Kec. Bogor Selatan, Kab. Bogor", provinsi: "Jawa Barat", meninggal: 0, hilang: 0, terluka: 0, rumahRusak: 12, rumahTerendam: 0, fasumRusak: 0 },
    { no: 4, idKabupaten: "3217", tanggalKejadian: "2025-10-26", kejadian: "TANAH LONGSOR", lokasi: "Kec. Lembang, Kab. Bandung Barat", provinsi: "Jawa Barat", meninggal: 0, hilang: 1, terluka: 0, rumahRusak: 0, rumahTerendam: 0, fasumRusak: 2 },
    { no: 5, idKabupaten: "3304", tanggalKejadian: "2025-10-24", kejadian: "TANAH LONGSOR", lokasi: "Kec. Banjarnegara, Kab. Banjarnegara", provinsi: "Jawa Tengah", meninggal: 0, hilang: 0, terluka: 0, rumahRusak: 5, rumahTerendam: 1, fasumRusak: 1 },
    { no: 6, idKabupaten: "3217", tanggalKejadian: "2025-10-24", kejadian: "TANAH LONGSOR", lokasi: "Kec. Cipongkor, Kab. Bandung Barat", provinsi: "Jawa Barat", meninggal: 0, hilang: 0, terluka: 0, rumahRusak: 0, rumahTerendam: 0, fasumRusak: 0 },
];
export const getDetailedLandslideData = (): DetailedLandslideEvent[] => {
    return [...detailedLandslideData];
};
