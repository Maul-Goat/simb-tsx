

import { NewsArticle, MonthlyStat, ProvinceStat } from '../types';

export const newsData: NewsArticle[] = [
    { id: 1, title: "BNPB: Waspada Potensi Longsor di Musim Hujan", summary: "Badan Nasional Penanggulangan Bencana (BNPB) mengimbau masyarakat untuk meningkatkan kewaspadaan terhadap potensi bencana tanah longsor seiring meningkatnya intensitas hujan di berbagai wilayah Indonesia.", date: "2024-07-15", category: "Peringatan Dini", image: "https://picsum.photos/seed/news1/600/400", content: "..." },
    { id: 2, title: "Teknologi Pemetaan Laser (LiDAR) untuk Mitigasi Longsor", summary: "Pemanfaatan teknologi LiDAR dinilai efektif untuk memetakan area rawan longsor dengan akurasi tinggi, membantu upaya mitigasi bencana.", date: "2024-07-12", category: "Teknologi", image: "https://picsum.photos/seed/news2/600/400", content: "..." },
    { id: 3, title: "Relawan Lokal Jadi Ujung Tombak Penanganan Longsor", summary: "Peran serta masyarakat dan relawan lokal sangat krusial dalam respons cepat dan penanganan awal saat terjadi bencana tanah longsor di daerah terpencil.", date: "2024-07-10", category: "Komunitas", image: "https://picsum.photos/seed/news3/600/400", content: "..." },
    { id: 4, title: "Pentingnya Vegetasi Vetiver untuk Mencegah Erosi", summary: "Penanaman rumput vetiver (akar wangi) terbukti mampu menahan erosi tanah dan menjadi solusi bioteknologi yang efektif untuk mencegah longsor.", date: "2024-07-08", category: "Edukasi", image: "https://picsum.photos/seed/news4/600/400", content: "..." },
    { id: 5, title: "Studi Kasus: Rekonstruksi Pasca-Longsor Banjarnegara", summary: "Belajar dari pengalaman, program rekonstruksi di Banjarnegara kini memprioritaskan relokasi dan pembangunan rumah tahan bencana.", date: "2024-07-05", category: "Studi Kasus", image: "https://picsum.photos/seed/news5/600/400", content: "..." },
    { id: 6, title: "Sistem Peringatan Dini Sederhana Berbasis Komunitas", summary: "Inovasi sistem peringatan dini (EWS) sederhana yang dikembangkan oleh warga menjadi contoh bagaimana komunitas dapat proaktif mengurangi risiko bencana.", date: "2024-07-01", category: "Inovasi", image: "https://picsum.photos/seed/news6/600/400", content: "..." },
];

export const monthlyStats2023: MonthlyStat[] = [
    { name: 'Jan', kejadian: 45 }, { name: 'Feb', kejadian: 52 }, { name: 'Mar', kejadian: 60 }, { name: 'Apr', kejadian: 48 },
    { name: 'Mei', kejadian: 35 }, { name: 'Jun', kejadian: 22 }, { name: 'Jul', kejadian: 18 }, { name: 'Agu', kejadian: 25 },
    { name: 'Sep', kejadian: 30 }, { name: 'Okt', kejadian: 41 }, { name: 'Nov', kejadian: 55 }, { name: 'Des', kejadian: 62 },
];

export const monthlyStats2024: MonthlyStat[] = [
    { name: 'Jan', kejadian: 65 }, { name: 'Feb', kejadian: 58 }, { name: 'Mar', kejadian: 50 }, { name: 'Apr', kejadian: 45 },
    { name: 'Mei', kejadian: 38 }, { name: 'Jun', kejadian: 28 }, { name: 'Jul', kejadian: 20 },
];

export const provinceDistribution: ProvinceStat[] = [
    { name: 'Jawa Barat', value: 120 },
    { name: 'Jawa Tengah', value: 95 },
    { name: 'Sumatera Barat', value: 70 },
    { name: 'Sulawesi Selatan', value: 65 },
    { name: 'Jawa Timur', value: 50 },
    { name: 'Lainnya', value: 150 },
];