import { useState, useEffect } from 'react';
import { MaintenanceType, BearingPosition, type LubricantType, type MotorFullHistoryDto, type Bearing } from '../types';
import { motorApi, lubricantApi, bearingApi } from '../services/api';
import toast from 'react-hot-toast';

const workTypes = [
    { value: MaintenanceType.Lubrication, label: 'Смазка', icon: '🛢️' },
    { value: MaintenanceType.BearingReplacement, label: 'Замена подшипника', icon: '⚙️' },
    { value: MaintenanceType.StatorRewinding, label: 'Перемотка статора', icon: '🔌' },
    { value: MaintenanceType.ShaftRepair, label: 'Ремонт вала', icon: '🔧' },
];

interface Props {
    motorId: number;
    motorData?: MotorFullHistoryDto | null;
    onAdded?: () => void;
    onCancel?: () => void;
    isModal?: boolean;
}

export default function MaintenanceForm({ motorId, motorData, onAdded, onCancel }: Props) {
    const [workType, setWorkType] = useState<MaintenanceType>(MaintenanceType.Lubrication);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [lubricants, setLubricants] = useState<LubricantType[]>([]);
    const [bearings, setBearings] = useState<Bearing[]>([]);
    const [bearingPosition, setBearingPosition] = useState<BearingPosition>(BearingPosition.Front);
    const [lubricantTypeId, setLubricantTypeId] = useState<number | ''>('');
    const [newBearingId, setNewBearingId] = useState<number | ''>('');

    // Загрузка справочников
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lubs, brgs] = await Promise.all([
                    lubricantApi.getAll(),
                    bearingApi.getAll()
                ]);
                setLubricants(lubs);
                setBearings(brgs);
            } catch (err) {
                toast.error('Не удалось загрузить справочники');
            }
        };
        fetchData();
    }, []);

    // Предустановки на основе motorData
    useEffect(() => {
        if (!motorData) return;
        if (workType === MaintenanceType.Lubrication && lubricants.length > 0) {
            const lastLubricantName = bearingPosition === BearingPosition.Front
                ? motorData.frontBearingLastLubricant
                : motorData.rearBearingLastLubricant;
            if (lastLubricantName) {
                const matched = lubricants.find(l => l.name === lastLubricantName);
                if (matched) setLubricantTypeId(matched.id);
                else if (lubricants.length) setLubricantTypeId(lubricants[0].id);
            } else if (lubricants.length) {
                setLubricantTypeId(lubricants[0].id);
            }
        } else if (workType === MaintenanceType.BearingReplacement && bearings.length > 0) {
            const currentBearingId = bearingPosition === BearingPosition.Front
                ? motorData.frontBearingId
                : motorData.rearBearingId;
            if (currentBearingId) setNewBearingId(currentBearingId);
            else if (bearings.length) setNewBearingId(bearings[0].id);
        }
    }, [workType, bearingPosition, motorData, lubricants, bearings]);

    const handleWorkTypeChange = (newType: MaintenanceType) => {
        setWorkType(newType);
        if (newType === MaintenanceType.BearingReplacement) setLubricantTypeId('');
        else if (newType === MaintenanceType.Lubrication) setNewBearingId('');
        else {
            setBearingPosition(BearingPosition.Front);
            setLubricantTypeId('');
            setNewBearingId('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = { workType, comment };

            if (workType === MaintenanceType.Lubrication) {
                if (!bearingPosition) throw new Error('Выберите позицию подшипника');
                if (!lubricantTypeId) throw new Error('Выберите тип смазки');
                payload.bearingPosition = bearingPosition;
                payload.lubricantTypeId = Number(lubricantTypeId);
            } else if (workType === MaintenanceType.BearingReplacement) {
                if (!bearingPosition) throw new Error('Выберите позицию подшипника');
                if (!newBearingId) throw new Error('Выберите новый подшипник');
                payload.bearingPosition = bearingPosition;
                payload.newBearingId = Number(newBearingId);
            }

            await motorApi.addMaintenance(motorId, payload);
            toast.success('Запись обслуживания добавлена');
            setComment('');
            setWorkType(MaintenanceType.Lubrication);
            setBearingPosition(BearingPosition.Front);
            setLubricantTypeId('');
            setNewBearingId('');
            onAdded?.();
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || 'Ошибка добавления записи');
        } finally {
            setLoading(false);
        }
    };

    const isLubrication = workType === MaintenanceType.Lubrication;
    const isBearingReplacement = workType === MaintenanceType.BearingReplacement;

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="form-label">Тип работ</label>
                <select value={workType} onChange={(e) => handleWorkTypeChange(e.target.value as MaintenanceType)} className="form-input">
                    {workTypes.map(wt => (
                        <option key={wt.value} value={wt.value}>{wt.icon} {wt.label}</option>
                    ))}
                </select>
            </div>

            {(isLubrication || isBearingReplacement) && (
                <div>
                    <label className="form-label">Позиция подшипника</label>
                    <select value={bearingPosition} onChange={(e) => setBearingPosition(e.target.value as BearingPosition)} className="form-input">
                        <option value={BearingPosition.Front}>Передний</option>
                        <option value={BearingPosition.Rear}>Задний</option>
                    </select>
                </div>
            )}

            {isLubrication && (
                <div>
                    <label className="form-label">Тип смазки</label>
                    <select value={lubricantTypeId} onChange={(e) => setLubricantTypeId(Number(e.target.value))} className="form-input" required>
                        <option value="">-- Выберите --</option>
                        {lubricants.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {isBearingReplacement && (
                <div>
                    <label className="form-label">Новый подшипник</label>
                    <select value={newBearingId} onChange={(e) => setNewBearingId(Number(e.target.value))} className="form-input" required>
                        <option value="">-- Выберите --</option>
                        {bearings.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.type} {b.manufacturer ? `(${b.manufacturer})` : ''}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Выберите подшипник из справочника. При необходимости добавьте новый через раздел «Подшипники».</p>
                </div>
            )}

            <div>
                <label className="form-label">Комментарий</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="form-input" rows={3} />
            </div>

            <div className="flex justify-end gap-3">
                {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Отмена</button>}
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Добавление...' : 'Добавить запись'}
                </button>
            </div>
        </form>
    );
}