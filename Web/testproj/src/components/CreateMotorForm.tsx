import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motorApi } from '../services/api';
import { MotorStatus, MountingType, type CreateMotorDto } from '../types';
import { motorStatusLabels, mountingTypeLabels } from '../utils/locales';

// Схема валидации формы создания двигателя
const schema = z.object({
    inventoryNumber: z.number({ invalid_type_error: 'Обязательное поле' }).positive('Инвентарный номер > 0'),
    type: z.string().min(1, 'Тип обязателен'),
    shaftDiameter: z.number().positive('Диаметр вала > 0'),
    power: z.number().positive('Мощность > 0'),
    speed: z.number().positive('Обороты > 0'),
    // Передний подшипник
    frontBearingType: z.string().min(1, 'Тип переднего подшипника обязателен'),
    frontBearingManufacturer: z.string().min(1, 'Производитель переднего подшипника обязателен'),
    frontBearingSupplier: z.string().min(1, 'Поставщик переднего подшипника обязателен'),
    // Задний подшипник
    rearBearingType: z.string().min(1, 'Тип заднего подшипника обязателен'),
    rearBearingManufacturer: z.string().min(1, 'Производитель заднего подшипника обязателен'),
    rearBearingSupplier: z.string().min(1, 'Поставщик заднего подшипника обязателен'),
    status: z.nativeEnum(MotorStatus),
    initialLocation: z.string().min(1, 'Начальное местоположение обязательно'),
    mountingType: z.nativeEnum(MountingType),
});

type FormData = z.infer<typeof schema>;

interface Props {
    /** Флаг видимости модального окна (только для модального режима) */
    isOpen?: boolean;
    /** Функция закрытия модального окна (только для модального режима) */
    onClose?: () => void;
    /** Функция, вызываемая после успешного создания двигателя */
    onSuccess: () => void;
}

/**
 * Форма регистрации нового электродвигателя.
 * Может работать в двух режимах:
 * - как модальное окно (если переданы isOpen и onClose)
 * - как обычная форма на отдельной странице (если isOpen и onClose отсутствуют)
 */
export default function CreateMotorForm({ isOpen, onClose, onSuccess }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            status: MotorStatus.InOperation,
            mountingType: MountingType.Feet,
        }
    });

    const onSubmit = async (data: FormData) => {
        try {
            const payload: CreateMotorDto = {
                inventoryNumber: data.inventoryNumber,
                type: data.type,
                shaftDiameter: data.shaftDiameter,
                power: data.power,
                speed: data.speed,
                frontBearing: {
                    type: data.frontBearingType,
                    manufacturer: data.frontBearingManufacturer,
                    supplier: data.frontBearingSupplier,
                },
                rearBearing: {
                    type: data.rearBearingType,
                    manufacturer: data.rearBearingManufacturer,
                    supplier: data.rearBearingSupplier,
                },
                status: data.status,
                initialLocation: data.initialLocation,
                mountingType: data.mountingType,
            };
            console.log('📤 Отправка данных:', payload);
            await motorApi.createMotor(payload);
            toast.success('Двигатель успешно зарегистрирован');
            reset();
            onSuccess();
            if (onClose) onClose(); // Закрываем модальное окно, если оно есть
        } catch (err: any) {
            console.error('❌ Ошибка запроса:', err);
            const message = err.response?.data?.error ||
                err.response?.data?.title ||
                'Ошибка создания двигателя';
            toast.error(message);
        }
    };

    // Рендер содержимого формы (без модальной обёртки)
    const formContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Основные поля */}
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
                    <label className="form-label">Диаметр вала (мм)</label>
                    <input type="number" step="0.1" {...register('shaftDiameter', { valueAsNumber: true })} className="form-input" placeholder="Например: 38" />
                    {errors.shaftDiameter && <p className="text-danger text-xs mt-1">{errors.shaftDiameter.message}</p>}
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
                    {errors.mountingType && <p className="text-danger text-xs mt-1">{errors.mountingType.message}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="form-label">Начальное местоположение</label>
                    <input {...register('initialLocation')} className="form-input" placeholder="Например: Насос P1.1" />
                    {errors.initialLocation && <p className="text-danger text-xs mt-1">{errors.initialLocation.message}</p>}
                </div>

                {/* Блок переднего подшипника */}
                <div className="md:col-span-2 border-t border-gray-200 dark:border-slate-700 pt-4 mt-2">
                    <h4 className="font-medium text-text-h mb-3">Передний подшипник</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">Тип</label>
                            <input {...register('frontBearingType')} className="form-input" placeholder="Например: 6308" />
                            {errors.frontBearingType && <p className="text-danger text-xs">{errors.frontBearingType.message}</p>}
                        </div>
                        <div>
                            <label className="form-label">Производитель</label>
                            <input {...register('frontBearingManufacturer')} className="form-input" placeholder="SKF, FAG, ..." />
                            {errors.frontBearingManufacturer && <p className="text-danger text-xs">{errors.frontBearingManufacturer.message}</p>}
                        </div>
                        <div>
                            <label className="form-label">Поставщик</label>
                            <input {...register('frontBearingSupplier')} className="form-input" placeholder="ООО 'ПодшипникСервис'" />
                            {errors.frontBearingSupplier && <p className="text-danger text-xs">{errors.frontBearingSupplier.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Блок заднего подшипника */}
                <div className="md:col-span-2 border-t border-gray-200 dark:border-slate-700 pt-4 mt-2">
                    <h4 className="font-medium text-text-h mb-3">Задний подшипник</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">Тип</label>
                            <input {...register('rearBearingType')} className="form-input" placeholder="Например: 6206" />
                            {errors.rearBearingType && <p className="text-danger text-xs">{errors.rearBearingType.message}</p>}
                        </div>
                        <div>
                            <label className="form-label">Производитель</label>
                            <input {...register('rearBearingManufacturer')} className="form-input" placeholder="SKF, FAG, ..." />
                            {errors.rearBearingManufacturer && <p className="text-danger text-xs">{errors.rearBearingManufacturer.message}</p>}
                        </div>
                        <div>
                            <label className="form-label">Поставщик</label>
                            <input {...register('rearBearingSupplier')} className="form-input" placeholder="ООО 'ПодшипникСервис'" />
                            {errors.rearBearingSupplier && <p className="text-danger text-xs">{errors.rearBearingSupplier.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                {onClose && (
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Отмена
                    </button>
                )}
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
    );

    // Если передан isOpen – работаем как модальное окно (с фоном)
    if (isOpen !== undefined) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                        <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                    <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-text-h flex items-center gap-2">
                                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Регистрация нового двигателя
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Заполните все технические характеристики</p>
                        </div>
                        {formContent}
                    </div>
                </div>
            </div>
        );
    }

    // Иначе – режим отдельной страницы (без фона)
    return (
        <div className="card">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-text-h flex items-center gap-2">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Регистрация нового двигателя
                </h2>
            </div>
            {formContent}
        </div>
    );
}