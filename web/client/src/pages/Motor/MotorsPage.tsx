import { useState } from 'react';
import { PageBreadCrumb } from '../../components/common';
/*import PageMeta from '../../components/common/PageMeta';*/
import { MotorList, CreateMotorForm, ManageLubricantsModal, MaintenanceReport } from '../../components/motor';
import { useAuth } from '../../context/AuthContext';
import { FaList, FaChartBar } from 'react-icons/fa';

/**
 * Страница управления электродвигателями.
 * Содержит две вкладки:
 * 1. Список двигателей – просмотр, регистрация, обслуживание.
 * 2. Отчёт по обслуживанию – детальный отчёт за период с фильтрацией.
 *
 * Кнопка "Новый двигатель" и управление типами смазки доступны только
 * пользователям с ролью Admin или Electric на вкладке "Список двигателей".
 * Отчёт доступен всем авторизованным пользователям.
 * Полностью поддерживает светлую и тёмную тему.
 */
export default function MotorsPage() {
    const [activeTab, setActiveTab] = useState<'list' | 'report'>('list');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isManageLubricantsOpen, setIsManageLubricantsOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const { isAdminOrElectric } = useAuth();

    const handleMotorCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/*<PageMeta*/}
                {/*    title="Управление электродвигателями"*/}
                {/*    description="Список, регистрация, обслуживание и отчёты по электродвигателям"*/}
                {/*/>*/}
                <PageBreadCrumb pageTitle="Управление электродвигателями" />

                <div className="space-y-8">
                    {/* Вкладки */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex gap-6">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'list'
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <FaList size={18} />
                                Список двигателей
                            </button>
                            <button
                                onClick={() => setActiveTab('report')}
                                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'report'
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <FaChartBar size={18} />
                                Отчёт по обслуживанию
                            </button>
                        </nav>
                    </div>

                    {/* Содержимое вкладок */}
                    {activeTab === 'list' && (
                        <>
                            {/* Кнопки открытия формы регистрации и управления типами смазки */}
                            <div className="flex justify-end gap-3 animate-slide-down">
                                <button
                                    onClick={() => setIsManageLubricantsOpen(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Типы смазки
                                </button>
                                {isAdminOrElectric && (
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Новый двигатель
                                    </button>
                                )}
                            </div>

                            {/* Список двигателей */}
                            <div className="animate-fade-in">
                                <MotorList key={refreshKey} />
                            </div>
                        </>
                    )}

                    {activeTab === 'report' && (
                        <div className="animate-fade-in">
                            <MaintenanceReport />
                        </div>
                    )}

                    {/* Модальное окно создания двигателя */}
                    <CreateMotorForm
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={handleMotorCreated}
                    />

                    {/* Модальное окно управления типами смазки */}
                    {isManageLubricantsOpen && (
                        <ManageLubricantsModal
                            isOpen={isManageLubricantsOpen}
                            onClose={() => setIsManageLubricantsOpen(false)}
                            onUpdate={() => {
                                // При необходимости можно обновить данные в уже открытых формах обслуживания,
                                // но они при следующем открытии сами перезагрузят список.
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}