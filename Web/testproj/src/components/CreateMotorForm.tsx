import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motorApi, bearingApi } from '../services/api';
import { MotorStatus, MountingType, type CreateMotorDto, type Bearing } from '../types';
import { motorStatusLabels, mountingTypeLabels } from '../utils/locales';
import { useEffect, useState } from 'react';

const schema = z.object({
    inventoryNumber: z.number({ invalid_type_error: 'Обязательное поле' }).positive('Инвентарный номер > 0'),
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: z.number().positive('Диаметр вала > 0'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    frontBearingId: z.number().optional(),
    rearBearingId: z.number().optional(),
    status: z.nativeEnum(MotorStatus),
    initialLocation: z.string().min(1, 'Начальное местоположение обязательно'),
    mountingType: z.nativeEnum(MountingType),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateMotorForm({ isOpen, onClose, onSuccess }: Props) {
    const [bearings, setBearings] = useState<Bearing[]>([]);
    const [loadingBearings, setLoadingBearings] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            status: MotorStatus.InOperation,
            mountingType: MountingType.Feet,
        }
    });

    // Загрузка списка подшипников при открытии формы
    useEffect(() => {
        if (isOpen) {
            const fetchBearings = async () => {
                setLoadingBearings(true);
                try {
                    const data = await bearingApi.getAll();
                    setBearings(data);
                } catch (err) {
                    toast.error('Не удалось загрузить список подшипников');
                } finally {
                    setLoadingBearings(false);
                }
            };
            fetchBearings();
        }
    }, [isOpen]);

    const onSubmit = async (data: FormData) => {
        try {
            const payload: CreateMotorDto = {
                inventoryNumber: data.inventoryNumber,
                type: data.type,
                shaftDiameter: data.shaftDiameter,
                power: data.power,
                speed: data.speed,
                frontBearingId: data.frontBearingId,
                rearBearingId: data.rearBearingId,
                status: data.status,
                initialLocation: data.initialLocation,
                mountingType: data.mountingType,
            };
            await motorApi.createMotor(payload);
            toast.success('Двигатель успешно зарегистрирован');
            reset();
            onSuccess();
            onClose();
        } catch (err: any) {
            const message = err.response?.data?.error || err.response?.data?.title || 'Ошибка создания двигателя';
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Регистрация нового двигателя
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Заполните все технические характеристики</p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="form-label">Инвентарный номер</label>
                                <input type="number" {...register('inventoryNumber', { valueAsNumber: true })} className="form-input" />
                                {errors.inventoryNumber && <p className="text-danger text-xs mt-1">{errors.inventoryNumber.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Тип двигателя</label>
                                <input {...register('type')} className="form-input" />
                                {errors.type && <p className="text-danger text-xs mt-1">{errors.type.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Диаметр вала (мм)</label>
                                <input type="number" step="0.1" {...register('shaftDiameter', { valueAsNumber: true })} className="form-input" />
                                {errors.shaftDiameter && <p className="text-danger text-xs mt-1">{errors.shaftDiameter.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Мощность (кВт)</label>
                                <input type="number" step="0.1" {...register('power', { valueAsNumber: true })} className="form-input" />
                                {errors.power && <p className="text-danger text-xs mt-1">{errors.power.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Обороты (об/мин)</label>
                                <input type="number" {...register('speed', { valueAsNumber: true })} className="form-input" />
                                {errors.speed && <p className="text-danger text-xs mt-1">{errors.speed.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Передний подшипник</label>
                                <select {...register('frontBearingId', { valueAsNumber: true })} className="form-input">
                                    <option value="">-- Не выбран --</option>
                                    {loadingBearings ? (
                                        <option disabled>Загрузка...</option>
                                    ) : (
                                        bearings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.type} {b.manufacturer ? `(${b.manufacturer})` : ''}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Выберите из справочника. При необходимости добавьте новый подшипник через раздел «Подшипники».</p>
                            </div>
                            <div>
                                <label className="form-label">Задний подшипник</label>
                                <select {...register('rearBearingId', { valueAsNumber: true })} className="form-input">
                                    <option value="">-- Не выбран --</option>
                                    {loadingBearings ? (
                                        <option disabled>Загрузка...</option>
                                    ) : (
                                        bearings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.type} {b.manufacturer ? `(${b.manufacturer})` : ''}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Статус</label>
                                <select {...register('status')} className="form-input">
                                    {Object.entries(motorStatusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Тип монтажа</label>
                                <select {...register('mountingType')} className="form-input">
                                    {Object.entries(mountingTypeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="form-label">Начальное местоположение</label>
                                <input {...register('initialLocation')} className="form-input" />
                                {errors.initialLocation && <p className="text-danger text-xs mt-1">{errors.initialLocation.message}</p>}
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[160px]">
                                {isSubmitting ? 'Сохранение...' : 'Зарегистрировать двигатель'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}