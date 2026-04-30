import { useState } from 'react';
import toast from 'react-hot-toast';
import { motorApi } from '../services/api';
import { MotorStatus } from '../types';
import { motorStatusLabels } from '../utils/locales';

interface Props {
    motorId: number;
    currentStatus?: MotorStatus;
    onMoved?: () => void;
}

export default function MoveMotorForm({ motorId, currentStatus, onMoved }: Props) {
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<MotorStatus | ''>(currentStatus || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim()) return toast.error('Введите новое местоположение');

        setLoading(true);
        try {
            const payload: { newLocation: string; newStatus?: MotorStatus } = { newLocation: location };
            if (status && status !== currentStatus) {
                payload.newStatus = status;
            }
            await motorApi.moveMotor(motorId, payload);
            toast.success(status && status !== currentStatus ? 'Двигатель перемещён, статус обновлён' : 'Перемещение выполнено');
            setLocation('');
            onMoved?.();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка перемещения');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = Object.entries(motorStatusLabels).map(([value, label]) => ({
        value: value as MotorStatus,
        label,
    }));

    return (
        <div className="card">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-text-h flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Перемещение и смена статуса
                </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="form-label">Новое местоположение</label>
                    <input
                        type="text"
                        placeholder="Цех / агрегат / склад"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div>
                    <label className="form-label">Новый статус (оставьте без изменений, если не нужен)</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as MotorStatus || '')}
                        className="form-input"
                    >
                        <option value="">― Не менять ―</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Выполняется...
                        </span>
                    ) : 'Переместить / изменить статус'}
                </button>
            </form>
        </div>
    );
}