import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDetailedLandslideData } from '../data/database';
import { DetailedLandslideEvent, ProvinceStat } from '../types';

const PageHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <div className="bg-background-secondary py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-poppins font-bold text-text-main">{title}</h1>
            <p className="mt-2 text-lg text-text-subtle">{subtitle}</p>
        </div>
    </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 border border-gray-300 rounded-lg text-sm shadow-md">
        <p className="label font-semibold text-text-main">{label || data.name}</p>
        <p className="intro" style={{ color: payload[0].color || payload[0].payload.fill }}>{`Jumlah: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const SortableTableHeader: React.FC<{
    column: keyof DetailedLandslideEvent;
    label: string;
    sortConfig: { key: keyof DetailedLandslideEvent; direction: 'ascending' | 'descending' } | null;
    requestSort: (key: keyof DetailedLandslideEvent) => void;
}> = ({ column, label, sortConfig, requestSort }) => {
    const isSorted = sortConfig?.key === column;
    const directionIcon = isSorted ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : '';
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-poppins font-bold text-text-main uppercase tracking-wider cursor-pointer" onClick={() => requestSort(column)}>
            {label} {directionIcon}
        </th>
    );
};


const StatsPage: React.FC = () => {
    const COLORS = ['#4A6C6F', '#E9A229', '#5CB85C', '#6E5E54', '#D9534F', '#3D2C21'];
    
    const [detailedData, setDetailedData] = useState<DetailedLandslideEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: keyof DetailedLandslideEvent; direction: 'ascending' | 'descending' } | null>({ key: 'tanggalKejadian', direction: 'descending' });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getDetailedLandslideData();
                setDetailedData(data);
            } catch (error) {
                console.error("Failed to load detailed data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const { sortedData, monthlyStats2023, monthlyStats2024, provinceDistribution } = useMemo(() => {
        let sortableItems = [...detailedData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        
        // Aggregate data for charts
        const monthlyAggregation: { [key: string]: { name: string, kejadian: number } } = {};
        const provinceAggregation: { [key: string]: number } = {};
        
        const currentYear = new Date().getFullYear();
        
        sortableItems.forEach(event => {
            const date = new Date(event.tanggalKejadian);
            const year = date.getFullYear();
            const month = date.toLocaleString('id-ID', { month: 'short' });
            
            // Monthly aggregation
            if (year === currentYear || year === currentYear - 1) {
                const key = `${year}-${month}`;
                if (!monthlyAggregation[key]) {
                    monthlyAggregation[key] = { name: month, kejadian: 0 };
                }
                monthlyAggregation[key].kejadian++;
            }
            
            // Province aggregation
            const province = event.provinsi || 'Lainnya';
            provinceAggregation[province] = (provinceAggregation[province] || 0) + 1;
        });
        
        const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const createYearlyStats = (year: number) => allMonths.map(month => ({
            name: month,
            kejadian: monthlyAggregation[`${year}-${month}`]?.kejadian || 0
        }));

        const monthlyStats2023 = createYearlyStats(currentYear - 1);
        const monthlyStats2024 = createYearlyStats(currentYear);

        const provinceDistribution: ProvinceStat[] = Object.entries(provinceAggregation)
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({ name, value }));
        
        return { sortedData: sortableItems, monthlyStats2023, monthlyStats2024, provinceDistribution };
    }, [detailedData, sortConfig]);

    const requestSort = (key: keyof DetailedLandslideEvent) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="bg-background-primary min-h-screen">
            <PageHeader title="Statistik & Data Bencana" subtitle="Analisis dan rincian data kejadian tanah longsor di Indonesia." />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                 {isLoading ? (
                    <div className="text-center p-10 bg-background-secondary rounded-2xl shadow-lg border">
                        <p className="text-text-subtle">Memuat data statistik...</p>
                    </div>
                 ) : (
                    <>
                    <section className="bg-background-secondary p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-main">Tabel Rincian Kejadian Bencana</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-background-tertiary">
                                    <tr>
                                        <SortableTableHeader column="no" label="No." sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader column="tanggalKejadian" label="Tanggal" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader column="lokasi" label="Lokasi" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader column="deskripsi" label="Deskripsi" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader column="provinsi" label="Provinsi" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader column="meninggal" label="Meninggal" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader column="terluka" label="Terluka" sortConfig={sortConfig} requestSort={requestSort} />
                                        <SortableTableHeader column="rumahRusak" label="Rumah Rusak" sortConfig={sortConfig} requestSort={requestSort} />
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedData.map((item) => (
                                        <tr key={item.no} className="hover:bg-background-tertiary">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-subtle">{item.no}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{new Date(item.tanggalKejadian).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{item.lokasi}</td>
                                            <td className="px-6 py-4 text-sm text-text-main max-w-xs truncate" title={item.deskripsi}>{item.deskripsi}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{item.provinsi}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.meninggal}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.terluka}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.rumahRusak}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-background-secondary p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-main">Grafik Jumlah Kejadian per Bulan</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-poppins font-medium text-text-main text-center mb-4">Tahun 2023</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlyStats2023} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                                        <XAxis dataKey="name" stroke="#6E5E54" />
                                        <YAxis stroke="#6E5E54" />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#4A6C6F10' }} />
                                        <Bar dataKey="kejadian" fill="#4A6C6F" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <h3 className="text-lg font-poppins font-medium text-text-main text-center mb-4">Tahun 2024 (YTD)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlyStats2024} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                                        <XAxis dataKey="name" stroke="#6E5E54" />
                                        <YAxis stroke="#6E5E54" />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#E9A22910' }}/>
                                        <Bar dataKey="kejadian" fill="#E9A229" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    <section className="bg-background-secondary p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-poppins font-semibold text-text-main text-center mb-6">Distribusi Kejadian per Provinsi</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={provinceDistribution as any}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {provinceDistribution.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#3D2C21' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </section>
                </>
                )}
            </div>
        </div>
    );
};

export default StatsPage;