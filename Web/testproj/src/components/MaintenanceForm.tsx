import { useState } from 'react';
import { MaintenanceType } from '../types';
import { motorApi } from '../services/api';
import toast from 'react-hot-toast';

const workTypes = [
    { value: MaintenanceType.Lubrication, label: 'Смазка', icon: '🛢️' },
    { value: MaintenanceType.BearingReplacement, label: 'Замена подшипника', icon: '⚙️' },
    { value: MaintenanceType.StatorRewinding, label: 'Перемотка статора', icon: '🔌' },
    { value: MaintenanceType.ShaftRepair, label: 'Ремонт вала', icon: '🔧' },
];

interface Props {
    motorId: number;
    onAdded?: () => void;
}

export default function MaintenanceForm({ motorId, onAdded }: Props) {
    const [workType, setWorkType] = useState<MaintenanceType>(MaintenanceType.Lubrication);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await motorApi.addMaintenance(motorId, { workType, comment });
            toast.success('Запись обслуживания добавлена');
            setComment('');
            onAdded?.();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка добавления записи');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-text-h flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Запись обслуживания / ремонта
                </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="form-label">Тип работ</label>
                    <select
                        value={workType}
                        onChange={(e) => setWorkType(e.target.value as MaintenanceType)}
                        className="form-input"
                    >
                        {workTypes.map(wt => (
                            <option key={wt.value} value={wt.value}>
                                {wt.icon} {wt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="form-label">Комментарий</label>
                    <textarea
                        placeholder="Опишите выполненные работы, замененные детали и т.д."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="form-input"
                        rows={3}
                    />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Добавление...
                        </span>
                    ) : 'Добавить запись'}
                </button>
            </form>
        </div>
    );
}