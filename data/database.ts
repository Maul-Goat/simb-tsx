import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LandslideFeatureCollection, NewsArticle, UserReport, LandslideDataPoint, DetailedLandslideEvent, KnowledgeArticle } from '../types';

let supabase: SupabaseClient | null = null;

// Hardcoded Supabase credentials
const supabaseUrl = 'https://gzjnusvsbzdsjffmiebu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6am51c3ZzYnpkc2pmZm1pZWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjQyNDIsImV4cCI6MjA3ODcwMDI0Mn0.q7-G3Q9pwbCCoiU-F9EFaRwsZkzZuEBOYyxEpQIfaDo';


const getSupabaseClient = (): SupabaseClient => {
    if (supabase) {
        return supabase;
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    return supabase;
};

// --- DATABASE AND STORAGE SETUP ---
// For image uploads, you need to create a public Storage bucket in your Supabase project.
// 1. Go to your Supabase project dashboard.
// 2. Click on the Storage icon in the left sidebar.
// 3. Click "New bucket".
// 4. Name the bucket `berita-images` and check the "Public bucket" option.
// 5. Click "Create bucket".
//
// For the news source URL, you need to add a new column to your `berita` table.
// 1. Go to the Table Editor in your Supabase project.
// 2. Select the `berita` table.
// 3. Click "+ Add column".
// 4. Name the column `sumber_url`, set its type to `text`, and allow it to be `NULLABLE`.
// 5. Click "Save".


// --- DATA GETTERS ---

export const getNewsData = async (): Promise<NewsArticle[]> => {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('berita').select('*').order('tanggal', { ascending: false });
    if (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
    return data.map((item: any) => ({
        id: item.id_berita,
        title: item.judul,
        summary: item.isi ? item.isi.substring(0, 120) + '...' : 'Ringkasan tidak tersedia.',
        image: item.gambar || 'https://picsum.photos/seed/news_default/600/400',
        date: new Date(item.tanggal).toISOString().split('T')[0],
        category: item.kategori || 'Berita',
        content: item.isi || 'Konten lengkap tidak tersedia.',
        sourceUrl: item.sumber_url,
    }));
};

export const getNewsArticleById = async (id: number): Promise<NewsArticle | null> => {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client.from('berita').select('*').eq('id_berita', id).single();
    if (error) {
        console.error('Error fetching single news article:', error);
        return null; // Don't throw, just return null if not found
    }
    if (!data) return null;

    return {
        id: data.id_berita,
        title: data.judul,
        summary: data.isi ? data.isi.substring(0, 120) + '...' : 'Ringkasan tidak tersedia.',
        image: data.gambar || 'https://picsum.photos/seed/news_default/600/400',
        date: new Date(data.tanggal).toISOString().split('T')[0],
        category: data.kategori || 'Berita',
        content: data.isi || 'Konten lengkap tidak tersedia.',
        sourceUrl: data.sumber_url,
    };
};

export const getOfficialLandslideData = async (): Promise<LandslideFeatureCollection> => {
    const client = getSupabaseClient();
    if (!client) return { type: "FeatureCollection", features: [] };

    const { data, error } = await client.from('kejadian_longsor').select('*');
    if (error) {
        console.error('Error fetching official landslide data:', error);
        throw error;
    }
    const features: LandslideDataPoint[] = data.map((item: any) => ({
        type: "Feature",
        properties: {
            id: item.id,
            lokasi: item.lokasi,
            tanggal: new Date(item.tanggal).toISOString().split('T')[0],
            korban_meninggal: item.korban_meninggal,
            korban_luka: item.korban_luka,
            kerusakan_rumah: item.rumah_rusak,
            sumber: item.sumber || "BNPB",
            deskripsi: item.deskripsi || '',
        },
        geometry: {
            type: "Point",
            coordinates: [item.lng, item.lat],
        },
    }));
    return { type: "FeatureCollection", features };
};

export const getDetailedLandslideData = async (): Promise<DetailedLandslideEvent[]> => {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('kejadian_longsor').select('*').order('tanggal', { ascending: false });
    if (error) {
        console.error('Error fetching detailed landslide data:', error);
        throw error;
    }
    return data.map((item: any, index: number) => ({
        id: item.id,
        no: index + 1,
        tanggalKejadian: new Date(item.tanggal).toISOString(),
        kejadian: "TANAH LONGSOR",
        lokasi: item.lokasi,
        provinsi: item.provinsi,
        meninggal: item.korban_meninggal,
        terluka: item.korban_luka,
        rumahRusak: item.rumah_rusak,
        rumahTerendam: 0,
        fasumRusak: 0,
        deskripsi: item.deskripsi || '',
    }));
};

export const getPendingUserReports = async (): Promise<UserReport[]> => {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('laporan').select('*').eq('status', 'baru');
    if (error) {
        console.error('Error fetching pending reports:', error);
        throw error;
    }
    return data.map((item: any) => ({
        id: item.id_laporan,
        latlng: [item.lat, item.lng],
        name: item.nama_pelapor,
        description: item.isi_laporan,
        status: 'pending',
        photo: item.foto,
        korbanMeninggal: item.korban_meninggal,
        korbanLuka: item.korban_luka,
        rumahRusak: item.rumah_rusak,
    }));
};

export const getKnowledgeData = async (): Promise<KnowledgeArticle[]> => {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client.from('materi').select('*');
    if (error) {
        console.error('Error fetching knowledge data:', error);
        throw error;
    }
    return data.map((item: any) => ({
        id: item.id_materi,
        category: item.kategori,
        title: item.judul,
        content: item.isi,
        image: item.gambar
    }));
};

// --- DATA MUTATIONS & STORAGE ---

export const uploadBeritaImage = async (file: File): Promise<string | null> => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured");

    const fileName = `public/news-image-${Date.now()}-${file.name}`;
    const { error: uploadError } = await client.storage
        .from('berita-images')
        .upload(fileName, file);

    if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
    }

    const { data } = client.storage
        .from('berita-images')
        .getPublicUrl(fileName);

    return data.publicUrl;
};

export const addBerita = async (berita: { judul: string; isi: string; gambar: string; tanggal: string; sumber_url?: string; }): Promise<any> => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured");

    const { data, error } = await client.from('berita').insert({
        judul: berita.judul,
        isi: berita.isi,
        gambar: berita.gambar,
        tanggal: berita.tanggal,
        sumber_url: berita.sumber_url
    });
    if (error) {
        console.error('Error adding news:', error);
        throw error;
    }
    return data;
};

export const addMateri = async (materi: { kategori: string; judul: string; isi: string; }): Promise<any> => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured");

    const { data, error } = await client.from('materi').insert({
        kategori: materi.kategori,
        judul: materi.judul,
        isi: materi.isi
    });
    if (error) {
        console.error('Error adding knowledge article:', error);
        throw error;
    }
    return data;
};

export const addUserReport = async (report: Omit<UserReport, 'id' | 'status' | 'photo'>): Promise<any> => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured");

    try {
        const { data, error } = await client.from('laporan').insert({
            nama_pelapor: report.name,
            lat: report.latlng[0],
            lng: report.latlng[1],
            lokasi: `(${report.latlng[0].toFixed(4)}, ${report.latlng[1].toFixed(4)})`,
            isi_laporan: report.description,
            status: 'baru', // 'pending' on the frontend is 'baru' in the DB
            korban_meninggal: report.korbanMeninggal,
            korban_luka: report.korbanLuka,
            rumah_rusak: report.rumahRusak,
        });
        if (error) {
            console.error('Error adding user report:', error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error("Caught error in addUserReport:", err);
        throw err;
    }
};


interface NewLandslideAdminData {
    lokasi: string;
    tanggal: string;
    deskripsi: string;
    korban_meninggal: number;
    korban_luka: number;
    kerusakan_rumah: number;
    coordinates: [number, number]; // [lat, lng]
}

export const addOfficialLandslide = async (data: NewLandslideAdminData): Promise<any> => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured");
    
    const { data: result, error } = await client.from('kejadian_longsor').insert({
        lokasi: data.lokasi,
        tanggal: data.tanggal,
        deskripsi: data.deskripsi,
        lat: data.coordinates[0],
        lng: data.coordinates[1],
        korban_meninggal: data.korban_meninggal,
        korban_luka: data.korban_luka,
        rumah_rusak: data.kerusakan_rumah,
        sumber: 'Admin Input',
        provinsi: data.lokasi.split(',').pop()?.trim() || 'N/A',
    });
    if (error) {
        console.error('Error adding official landslide:', error);
        throw error;
    }
    return result;
};

export const approveUserReport = async (reportId: number): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) return false;

    // 1. Get the report details first
    const { data: report, error: fetchError } = await client.from('laporan').select('*').eq('id_laporan', reportId).single();
    if (fetchError || !report) {
        console.error('Error fetching report to approve:', fetchError);
        return false;
    }

    // 2. Add a corresponding entry to the official 'kejadian_longsor' table
    const { error: insertError } = await client.from('kejadian_longsor').insert({
        lokasi: `Laporan dari ${report.nama_pelapor} di ${report.lokasi}`,
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: report.isi_laporan,
        lat: report.lat,
        lng: report.lng,
        sumber: `Laporan Masyarakat (${report.nama_pelapor})`,
        provinsi: 'N/A',
        korban_meninggal: report.korban_meninggal || 0,
        korban_luka: report.korban_luka || 0,
        rumah_rusak: report.rumah_rusak || 0,
    });
    if (insertError) {
        console.error('Error creating official event from report:', insertError);
        return false; // Stop if we can't create the official event
    }

    // 3. Update the report status to 'selesai' (approved)
    const { error: updateError } = await client.from('laporan').update({ status: 'selesai' }).eq('id_laporan', reportId);
    if (updateError) {
        console.error('Error updating report status to approved:', updateError);
        // This is a partial success, might need manual correction in DB.
        return false;
    }
    
    return true;
};

export const rejectUserReport = async (reportId: number): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) return false;

    // In our schema, 'selesai' means the report is processed, regardless of outcome.
    // For a more robust system, a 'ditolak' status would be better.
    const { error } = await client.from('laporan').update({ status: 'selesai' }).eq('id_laporan', reportId);
    if (error) {
        console.error('Error rejecting report:', error);
        return false;
    }
    return true;
};

// --- DATA DELETIONS ---
export const deleteBerita = async (id: number): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client.from('berita').delete().eq('id_berita', id);
    if (error) {
        console.error('Error deleting news:', error);
        return false;
    }
    return true;
};

export const deleteKejadian = async (id: number): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client.from('kejadian_longsor').delete().eq('id', id);
     if (error) {
        console.error('Error deleting landslide event:', error);
        return false;
    }
    return true;
};

export const deleteMateri = async (id: number): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client.from('materi').delete().eq('id_materi', id);
     if (error) {
        console.error('Error deleting knowledge article:', error);
        return false;
    }
    return true;
};