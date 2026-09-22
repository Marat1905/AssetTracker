import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { motorApi } from '../../../services/motor/api';
import { MotorStatus, MountingType, type CreateMotorDto } from '../../../types/motor/motor';
import { motorStatusLabels, mountingTypeLabels } from '../../../utils/motor/locales';
import { createMotorSchema, type CreateMotorFormData } from '../../../schemas/motor';

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
 *
 * В модальном режиме используется затемняющий фон и центрирование.
 * Форма компактная, без вертикальной прокрутки на большинстве экранов (адаптивная высота).
 * Полностью поддерживает светлую и тёмную тему.
 */
export default function CreateMotorForm({ isOpen, onClose, onSuccess }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateMotorFormData>({
        resolver: zodResolver(createMotorSchema),
        defaultValues: {
            status: MotorStatus.InOperation,
            mountingType: MountingType.Feet,
            inventoryNumber: '',
        }
    });

    const onSubmit = async (data: CreateMotorFormData) => {
        try {
            const payload: CreateMotorDto = {
                // Пустую строку преобразуем в null
                inventoryNumber: data.inventoryNumber && data.inventoryNumber.trim() !== '' ? data.inventoryNumber.trim() : null,
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
            if (onClose) onClose();
        } catch (err: any) {
            console.error('❌ Ошибка запроса:', err);
            const message = err.response?.data?.error ||
                err.response?.data?.title ||
                'Ошибка создания двигателя';
            toast.error(message);
        }
    };

    // Рендер содержимого формы (компактная версия)
    const formContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Основные поля */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Инв. номер (опционально)
                    </label>
                    <input
                        type="text"
                        {...register('inventoryNumber')}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        placeholder="Например: 12345"
                    />
                    {errors.inventoryNumber && <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{errors.inventoryNumber.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Тип двигателя
                    </label>
                    <input
                        {...register('type')}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        placeholder="Например: АИР132М4"
                    />
                    {errors.type && <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{errors.type.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Диаметр вала (мм)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('shaftDiameter', { valueAsNumber: true })}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        placeholder="Например: 38"
                    />
                    {errors.shaftDiameter && <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{errors.shaftDiameter.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Мощность (кВт)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        {...register('power', { valueAsNumber: true })}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        placeholder="Например: 15.5"
                    />
                    {errors.power && <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{errors.power.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Обороты (об/мин)
                    </label>
                    <input
                        type="number"
                        {...register('speed', { valueAsNumber: true })}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        placeholder="Например: 1500"
                    />
                    {errors.speed && <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{errors.speed.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Статус
                    </label>
                    <select
                        {...register('status')}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        {Object.entries(motorStatusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Тип монтажа
                    </label>
                    <select
                        {...register('mountingType')}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        {Object.entries(mountingTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    {errors.mountingType && <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{errors.mountingType.message}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Начальное местоположение
                    </label>
                    <input
                        {...register('initialLocation')}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        placeholder="Например: Насос P1.1"
                    />
                    {errors.initialLocation && <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">{errors.initialLocation.message}</p>}
                </div>

                {/* Блок переднего подшипника - компактный */}
                <div className="md:col-span-2 border-t border-gray-200 dark:border-slate-700 pt-2 mt-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">Передний подшипник</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Тип
                            </label>
                            <input
                                {...register('frontBearingType')}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                placeholder="6308"
                            />
                            {errors.frontBearingType && <p className="text-red-600 dark:text-red-400 text-xs">{errors.frontBearingType.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Производитель
                            </label>
                            <input
                                {...register('frontBearingManufacturer')}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                placeholder="SKF, FAG"
                            />
                            {errors.frontBearingManufacturer && <p className="text-red-600 dark:text-red-400 text-xs">{errors.frontBearingManufacturer.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Поставщик
                            </label>
                            <input
                                {...register('frontBearingSupplier')}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                placeholder="ООО 'ПодшипникСервис'"
                            />
                            {errors.frontBearingSupplier && <p className="text-red-600 dark:text-red-400 text-xs">{errors.frontBearingSupplier.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Блок заднего подшипника - компактный */}
                <div className="md:col-span-2 border-t border-gray-200 dark:border-slate-700 pt-2 mt-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2">Задний подшипник</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Тип
                            </label>
                            <input
                                {...register('rearBearingType')}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                placeholder="6206"
                            />
                            {errors.rearBearingType && <p className="text-red-600 dark:text-red-400 text-xs">{errors.rearBearingType.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Производитель
                            </label>
                            <input
                                {...register('rearBearingManufacturer')}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                placeholder="SKF, FAG"
                            />
                            {errors.rearBearingManufacturer && <p className="text-red-600 dark:text-red-400 text-xs">{errors.rearBearingManufacturer.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Поставщик
                            </label>
                            <input
                                {...register('rearBearingSupplier')}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                placeholder="ООО 'ПодшипникСервис'"
                            />
                            {errors.rearBearingSupplier && <p className="text-red-600 dark:text-red-400 text-xs">{errors.rearBearingSupplier.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 md:mt-5 flex justify-end gap-2">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                    >
                        Отмена
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 min-w-[140px] flex items-center justify-center text-sm"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Сохранение...
                        </span>
                    ) : 'Зарегистрировать'}
                </button>
            </div>
        </form>
    );

    // Если передан isOpen – работаем как модальное окно (адаптивная высота без прокрутки)
    if (isOpen !== undefined) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Затемняющий фон (overlay) */}
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
                </div>

                {/* Модальное окно - адаптивная ширина, высота автоматическая (без прокрутки) */}
                <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Регистрация нового двигателя
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Заполните все технические характеристики</p>
                    </div>
                    {formContent}
                </div>
            </div>
        );
    }

    // Иначе – режим отдельной страницы (без фона)
    return (
        <div className="card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Регистрация нового двигателя
                </h2>
            </div>
            {formContent}
        </div>
    );
}