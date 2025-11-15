import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { monthlyStats2023, monthlyStats2024, provinceDistribution, getDetailedLandslideData } from '../data/database';
import { DetailedLandslideEvent } from '../types';

const PageHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <div className="bg-secondary-light py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-poppins font-bold text-text-dark">{title}</h1>
            <p className="mt-2 text-lg text-text-muted">{subtitle}</p>
        </div>
    </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 border border-gray-300 rounded-lg text-sm shadow-md">
        <p className="label font-semibold text-text-dark">{label || data.name}</p>
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
        <th scope="col" className="px-6 py-3 text-left text-xs font-poppins font-bold text-text-dark uppercase tracking-wider cursor-pointer" onClick={() => requestSort(column)}>
            {label} {directionIcon}
        </th>
    );
};


const StatsPage: React.FC = () => {
    const COLORS = ['#007BFF', '#FD7E14', '#28A745', '#6C757D', '#17A2B8', '#6610F2'];
    
    const detailedData = useMemo(() => getDetailedLandslideData(), []);
    const [sortConfig, setSortConfig] = useState<{ key: keyof DetailedLandslideEvent; direction: 'ascending' | 'descending' } | null>({ key: 'tanggalKejadian', direction: 'descending' });

    const sortedData = useMemo(() => {
        let sortableItems = [...detailedData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [detailedData, sortConfig]);

    const requestSort = (key: keyof DetailedLandslideEvent) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="bg-primary-light min-h-screen">
            <PageHeader title="Statistik & Data Bencana" subtitle="Analisis dan rincian data kejadian tanah longsor di Indonesia." />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                <section className="bg-secondary-light p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-dark">Tabel Rincian Kejadian Bencana</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-soft">
                                <tr>
                                    <SortableTableHeader column="no" label="No." sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader column="tanggalKejadian" label="Tanggal" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader column="lokasi" label="Lokasi" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader column="provinsi" label="Provinsi" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader column="meninggal" label="Meninggal" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader column="terluka" label="Terluka" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader column="rumahRusak" label="Rumah Rusak" sortConfig={sortConfig} requestSort={requestSort} />
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedData.map((item) => (
                                    <tr key={item.no} className="hover:bg-primary-light">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{item.no}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{new Date(item.tanggalKejadian).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{item.lokasi}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{item.provinsi}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.meninggal}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.terluka}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{item.rumahRusak}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="bg-secondary-light p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-dark">Grafik Jumlah Kejadian per Bulan</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-poppins font-medium text-text-dark text-center mb-4">Tahun 2023</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyStats2023} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                                    <XAxis dataKey="name" stroke="#6c757d" />
                                    <YAxis stroke="#6c757d" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#007bff10' }} />
                                    <Bar dataKey="kejadian" fill="#697565" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="text-lg font-poppins font-medium text-text-dark text-center mb-4">Tahun 2024 (YTD)</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyStats2024} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                                    <XAxis dataKey="name" stroke="#6c757d" />
                                    <YAxis stroke="#6c757d" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fd7e1410' }}/>
                                    <Bar dataKey="kejadian" fill="#D97A36" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                <section className="bg-secondary-light p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-poppins font-semibold text-text-dark text-center mb-6">Distribusi Kejadian per Provinsi (2 Tahun Terakhir)</h2>
                    <ResponsiveContainer width="100%" height={400}>
                         <PieChart>
                            <Pie
                                // FIX: Cast to `any` to bypass recharts' strict typing for Pie data, which expects an index signature not present in `ProvinceStat`.
                                data={provinceDistribution as any}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                // FIX: Using `any` for the label function's argument to resolve typing errors with recharts.
                                // The type definitions for PieLabelRenderProps seem to be incorrect or incomplete in this environment,
                                // causing a cascading type error for the 'data' prop. `any` bypasses this issue.
                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {provinceDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: '#212529' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </section>
            </div>
        </div>
    );
};

export default StatsPage;