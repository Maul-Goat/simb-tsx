
export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  image: string;
  date: string;
  category: string;
  content: string;
}

export interface LandslideDataPoint {
  type: "Feature";
  properties: {
    id: number;
    lokasi: string;
    tanggal: string;
    korban_meninggal: number;
    korban_luka: number;
    kerusakan_rumah: number;
    sumber: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface LandslideFeatureCollection {
  type: "FeatureCollection";
  features: LandslideDataPoint[];
}

export interface MonthlyStat {
  name: string;
  kejadian: number;
}

export interface ProvinceStat {
    name: string;
    value: number;
}

export interface UserReport {
  id: number;
  latlng: [number, number];
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  photo?: string;
  korban_jiwa?: number;
  korban_luka?: number;
  rumah_rusak?: number;
}

export interface DetailedLandslideEvent {
  id: number;
  no: number;
  idKabupaten: string;
  tanggalKejadian: string;
  kejadian: string;
  lokasi: string;
  provinsi: string;
  meninggal: number;
  hilang: number;
  terluka: number;
  rumahRusak: number;
  rumahTerendam: number;
  fasumRusak: number;
}

export interface KnowledgeArticle {
  id: number;
  category: string;
  title: string;
  content: string;
  image?: string;
}