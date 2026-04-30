import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motorApi } from '../services/api';
import { MotorStatus, type CreateMotorDto } from '../types';
import { motorStatusLabels } from '../utils/locales';

const schema = z.object({
    inventoryNumber: z.number({ invalid_type_error: 'Обязательное поле' }).positive('Инвентарный номер > 0'),
    type: z.string().min(1, 'Тип обязателен'),
    dimensions: z.string().min(1, 'Габариты обязательны'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    frontBearingType: z.string().min(1, 'Передний подшипник обязателен'),
    rearBearingType: z.string().min(1, 'Задний подшипник обязателен'),
    status: z.nativeEnum(MotorStatus),
    initialLocation: z.string().min(1, 'Начальное местоположение обязательно'),
});

type FormData = z.infer<typeof schema>;

export default function CreateMotorForm({ onSuccess }: { onSuccess?: () => void }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { status: MotorStatus.InOperation }
    });

    const onSubmit = async (data: FormData) => {
        try {
            console.log('📤 Отправка данных:', data);
            await motorApi.createMotor(data as CreateMotorDto);
            toast.success('Двигатель успешно зарегистрирован');
            reset();
            onSuccess?.();
        } catch (err: any) {
            console.error('❌ Ошибка запроса:', err);
            const message = err.response?.data?.error ||
                err.response?.data?.title ||
                'Ошибка создания двигателя';
            toast.error(message);
        }
    };

    return (
        <div className="card">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-text-h flex items-center gap-2">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Регистрация нового двигателя
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Заполните все технические характеристики</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="form-label">Инвентарный номер</label>
                        <input type="number" {...register('inventoryNumber', { valueAsNumber: true })} className="form-input" placeholder="Например: 12345" />
                        {errors.inventoryNumber && <p className="text-danger text-xs mt-1">{errors.inventoryNumber.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Тип двигателя</label>
                        <input {...register('type')} className="form-input" placeholder="Например: АИР132М4" />
                        {errors.type && <p className="text-danger text-xs mt-1">{errors.type.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Габариты (ДхШхВ)</label>
                        <input {...register('dimensions')} className="form-input" placeholder="Например: 300x200x250 мм" />
                        {errors.dimensions && <p className="text-danger text-xs mt-1">{errors.dimensions.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Мощность (кВт)</label>
                        <input type="number" step="0.1" {...register('power', { valueAsNumber: true })} className="form-input" placeholder="Например: 15.5" />
                        {errors.power && <p className="text-danger text-xs mt-1">{errors.power.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Обороты (об/мин)</label>
                        <input type="number" {...register('speed', { valueAsNumber: true })} className="form-input" placeholder="Например: 1500" />
                        {errors.speed && <p className="text-danger text-xs mt-1">{errors.speed.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Передний подшипник</label>
                        <input {...register('frontBearingType')} className="form-input" placeholder="Например: 6308" />
                        {errors.frontBearingType && <p className="text-danger text-xs mt-1">{errors.frontBearingType.message}</p>}
                    </div>
                    <div>
                        <label className="form-label">Задний подшипник</label>
                        <input {...register('rearBearingType')} className="form-input" placeholder="Например: 6206" />
                        {errors.rearBearingType && <p className="text-danger text-xs mt-1">{errors.rearBearingType.message}</p>}
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
                        <label className="form-label">Начальное местоположение</label>
                        <input {...register('initialLocation')} className="form-input" placeholder="Например: Цех №3, Станок A-12" />
                        {errors.initialLocation && <p className="text-danger text-xs mt-1">{errors.initialLocation.message}</p>}
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[160px]">
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Сохранение...
                            </span>
                        ) : 'Зарегистрировать двигатель'}
                    </button>
                </div>
            </form>
        </div>
    );
}