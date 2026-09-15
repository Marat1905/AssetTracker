import { useState, useEffect } from 'react';
import { lubricantApi } from '../../services/motor/api';
import type { LubricantType, CreateLubricantTypeDto } from '../../types/motor/motor';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

/**
 * Модальное окно для управления справочником типов смазки.
 * Позволяет добавлять, редактировать и удалять типы смазки.
 * Полностью поддерживает светлую и тёмную тему.
 * Вертикальная прокрутка присутствует только внутри области со списком типов,
 * само модальное окно не имеет общей прокрутки.
 *
 * Доступ к управлению (добавление, редактирование, удаление) имеют только пользователи
 * с ролью Admin или Electric (isAdminOrElectric = true).
 * Для остальных пользователей отображается только список типов смазки без возможности изменений.
 */
export default function ManageLubricantsModal({ isOpen, onClose, onUpdate }: Props) {
    const { isAdminOrElectric } = useAuth(); // проверка прав: админ или электрик

    const [lubricants, setLubricants] = useState<LubricantType[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');

    // Загрузка списка типов смазки
    const fetchLubricants = async () => {
        try {
            const data = await lubricantApi.getAll();
            setLubricants(data);
        } catch (err) {
            toast.error('Ошибка загрузки типов смазки');
        }
    };

    // Загружаем данные при открытии модального окна
    useEffect(() => {
        if (isOpen) {
            fetchLubricants();
        }
    }, [isOpen]);

    // Сброс формы
    const resetForm = () => {
        setEditingId(null);
        setFormName('');
        setFormDescription('');
    };

    // Обработка сохранения (добавление или обновление) – доступно только при наличии прав
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdminOrElectric) {
            toast.error('У вас нет прав на изменение типов смазки');
            return;
        }
        if (!formName.trim()) {
            toast.error('Название типа смазки обязательно');
            return;
        }

        setLoading(true);
        try {
            if (editingId === null) {
                // Добавление
                const newItem: CreateLubricantTypeDto = {
                    name: formName.trim(),
                    description: formDescription.trim() || undefined,
                };
                await lubricantApi.create(newItem);
                toast.success('Тип смазки добавлен');
            } else {
                // Редактирование
                await lubricantApi.update(editingId, {
                    name: formName.trim(),
                    description: formDescription.trim() || undefined,
                });
                toast.success('Тип смазки обновлён');
            }
            resetForm();
            await fetchLubricants();
            onUpdate?.(); // уведомляем родителя (например, чтобы обновить выпадающие списки в открытых формах)
        } catch (err: any) {
            const message = err.response?.data?.error || 'Ошибка сохранения';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Начать редактирование – доступно только при наличии прав
    const handleEdit = (item: LubricantType) => {
        if (!isAdminOrElectric) {
            toast.error('У вас нет прав на редактирование типов смазки');
            return;
        }
        setEditingId(item.id);
        setFormName(item.name);
        setFormDescription(item.description || '');
    };

    // Удаление – доступно только при наличии прав
    const handleDelete = async (id: number, name: string) => {
        if (!isAdminOrElectric) {
            toast.error('У вас нет прав на удаление типов смазки');
            return;
        }
        if (!confirm(`Удалить тип смазки "${name}"?\nЭто действие может быть запрещено, если тип уже используется.`)) return;
        try {
            await lubricantApi.delete(id);
            toast.success('Тип смазки удалён');
            await fetchLubricants();
            onUpdate?.();
            if (editingId === id) resetForm(); // если удалили редактируемый элемент
        } catch (err: any) {
            const message = err.response?.data?.error || 'Ошибка удаления';
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Затемняющий фон (overlay) */}
            <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-80"></div>
            </div>

            {/* Модальное окно – без вертикальной прокрутки на уровне контейнера, с overflow-hidden для скругления углов */}
            <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Заголовок (фиксированный, не скроллится) */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Управление типами смазки
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Добавление, редактирование и удаление типов смазки, используемых при обслуживании
                    </p>
                </div>

                {/* Основное содержимое – без overflow-y-auto, растягивается по контенту */}
                <div className="flex-1 p-6 space-y-6">
                    {/* Форма добавления/редактирования – отображается только для администраторов и электриков */}
                    {isAdminOrElectric ? (
                        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Название <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Например: Литол-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Описание (необязательно)
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    rows={2}
                                    placeholder="Дополнительная информация о смазке"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                {editingId !== null && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Отменить редактирование
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Сохранение...' : (editingId === null ? 'Добавить' : 'Обновить')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-yellow-800 dark:text-yellow-200 text-sm">
                            ⚠️ У вас нет прав на управление типами смазки. Только администраторы и электрики могут добавлять, редактировать или удалять записи.
                        </div>
                    )}

                    {/* Блок существующих типов – только здесь появляется вертикальная прокрутка */}
                    <div>
                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Существующие типы</h4>
                        {lubricants.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Нет добавленных типов смазки</p>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin custom-scrollbar pr-1">
                                {lubricants.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                            {item.description && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                                            )}
                                        </div>
                                        {/* Кнопки действий – отображаются только для администраторов и электриков */}
                                        {isAdminOrElectric && (
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    title="Редактировать"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                    title="Удалить"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Футер (фиксированный, не скроллится) */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}