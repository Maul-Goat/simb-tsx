import React from 'react';
import { LogoIcon } from '../constants';

const AboutPage: React.FC = () => {
    return (
        <div className="bg-background-primary min-h-screen">
            <div className="bg-background-secondary border-b border-gray-200">
                <div className="max-w-6xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <LogoIcon />
                        <h1 className="text-4xl font-poppins font-bold tracking-tight text-text-main sm:text-5xl lg:text-6xl">Tentang SIGLON</h1>
                    </div>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-text-subtle">
                        Mengenal, Mencegah, dan Memantau Tanah Longsor di Indonesia.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="prose prose-lg max-w-none text-text-subtle prose-headings:text-text-main prose-headings:font-poppins">
                    <p className="lead text-text-main">
                        SIGLON (Sistem Informasi Geospasial Tanah Longsor Nasional) adalah sebuah inisiatif berbasis web yang didedikasikan untuk menjadi pusat informasi, pemantauan, dan edukasi mengenai bencana tanah longsor di Indonesia.
                    </p>

                    <h2 className="mt-12">Misi Kami</h2>
                    <p>
                        Misi kami adalah untuk meningkatkan kesadaran dan kesiapsiagaan masyarakat terhadap ancaman tanah longsor melalui penyediaan data yang akurat, informasi yang mudah diakses, dan materi edukasi yang komprehensif. Kami percaya bahwa pemahaman yang baik adalah kunci utama dalam upaya mitigasi dan pengurangan risiko bencana.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Edukasi:</strong> Menyediakan konten mendalam tentang penyebab, jenis, dan cara pencegahan tanah longsor.</li>
                        <li><strong>Informasi:</strong> Menyajikan data kejadian real-time, statistik, dan berita terbaru dari sumber terpercaya.</li>
                        <li><strong>Visualisasi:</strong> Mengubah data kompleks menjadi peta interaktif dan grafik yang mudah dipahami oleh semua kalangan.</li>
                    </ul>
                    
                    <h2 className="mt-12">Visi Kami</h2>
                    <p>
                        Kami bercita-cita untuk membangun masyarakat Indonesia yang tangguh bencana, di mana setiap individu memiliki pengetahuan dan alat yang cukup untuk melindungi diri, keluarga, dan lingkungannya dari ancaman tanah longsor. Melalui teknologi dan kolaborasi, SIGLON berupaya menjadi platform rujukan nasional dalam diseminasi informasi kebencanaan.
                    </p>

                    <h2 className="mt-12">Narahubung Penting</h2>
                    <p>Dalam keadaan darurat, segera hubungi pihak berwenang melalui kontak di bawah ini:</p>
                     <ul className="list-none pl-0 space-y-3">
                        <li><strong>BNPB (Badan Nasional Penanggulangan Bencana):</strong> Call Center 117</li>
                        <li><strong>Basarnas (Badan SAR Nasional):</strong> Call Center 115</li>
                        <li><strong>PMI (Palang Merah Indonesia):</strong> (021) 7992325</li>
                        <li><strong>Layanan Darurat Umum:</strong> 112</li>
                    </ul>
                    
                    <h2 className="mt-12">Tim Pengembang</h2>
                     <p>
                        Aplikasi ini dikembangkan sebagai bagian dari studi kasus untuk menunjukkan bagaimana teknologi dapat dimanfaatkan dalam mitigasi bencana.
                    </p>

                    <div className="mt-12 p-6 bg-brand-primary/10 rounded-2xl border border-brand-primary/30">
                        <h3 className="font-poppins font-semibold text-text-main">Sumber Data</h3>
                        <p className="mt-2 text-sm text-text-subtle">
                            Seluruh data kejadian bencana yang ditampilkan di platform ini bersumber dari Data Informasi Bencana Indonesia (DIBI) yang dikelola secara resmi oleh Badan Nasional Penanggulangan Bencana (BNPB). Kami berkomitmen untuk menyajikan data yang valid dan dapat dipertanggungjawabkan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;