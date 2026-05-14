import { useState, useEffect } from 'react';
import { MaintenanceType, BearingPosition, type LubricantType } from '../types';
import { motorApi, lubricantApi } from '../services/api';
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
    onCancel?: () => void;
    isModal?: boolean;
}

export default function MaintenanceForm({ motorId, onAdded, onCancel, isModal }: Props) {
    const [workType, setWorkType] = useState<MaintenanceType>(MaintenanceType.Lubrication);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [lubricants, setLubricants] = useState<LubricantType[]>([]);
    const [bearingPosition, setBearingPosition] = useState<BearingPosition>(BearingPosition.Front);
    const [lubricantTypeId, setLubricantTypeId] = useState<number | ''>('');

    // Загрузка списка типов смазки при монтировании
    useEffect(() => {
        const fetchLubricants = async () => {
            try {
                const data = await lubricantApi.getAll();
                setLubricants(data);
                if (data.length > 0) setLubricantTypeId(data[0].id);
            } catch (err) {
                console.error('Ошибка загрузки типов смазки', err);
                toast.error('Не удалось загрузить типы смазки');
            }
        };
        fetchLubricants();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = { workType, comment };

            // Для смазки обязательно передаём позицию и тип смазки
            if (workType === MaintenanceType.Lubrication) {
                if (!bearingPosition) {
                    toast.error('Выберите позицию подшипника');
                    setLoading(false);
                    return;
                }
                if (!lubricantTypeId) {
                    toast.error('Выберите тип смазки');
                    setLoading(false);
                    return;
                }
                payload.bearingPosition = bearingPosition;
                payload.lubricantTypeId = Number(lubricantTypeId);
            }

            await motorApi.addMaintenance(motorId, payload);
            toast.success('Запись обслуживания добавлена');
            setComment('');
            setWorkType(MaintenanceType.Lubrication);
            setBearingPosition(BearingPosition.Front);
            setLubricantTypeId(lubricants.length > 0 ? lubricants[0].id : '');
            onAdded?.();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка добавления записи');
        } finally {
            setLoading(false);
        }
    };

    const isLubrication = workType === MaintenanceType.Lubrication;

    return (
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

            {/* Дополнительные поля только для смазки */}
            {isLubrication && (
                <>
                    <div>
                        <label className="form-label">Позиция подшипника</label>
                        <select
                            value={bearingPosition}
                            onChange={(e) => setBearingPosition(e.target.value as BearingPosition)}
                            className="form-input"
                        >
                            <option value={BearingPosition.Front}>Передний</option>
                            <option value={BearingPosition.Rear}>Задний</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Тип смазки</label>
                        <select
                            value={lubricantTypeId}
                            onChange={(e) => setLubricantTypeId(Number(e.target.value))}
                            className="form-input"
                            required
                        >
                            {lubricants.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                        {lubricants.length === 0 && (
                            <p className="text-xs text-danger mt-1">Нет доступных типов смазки. Добавьте через справочник.</p>
                        )}
                    </div>
                </>
            )}

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

            <div className="flex justify-end gap-3">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-secondary">
                        Отмена
                    </button>
                )}
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Добавление...
                        </span>
                    ) : 'Добавить запись'}
                </button>
            </div>
        </form>
    );
}