import React from 'react';

export enum MountingType {
    Feet = 'Feet',
    FeetAndFlange = 'FeetAndFlange',
    Flange = 'Flange'
}

interface MotorDiagramProps {
    shaftDiameter: number;
    frontBearingType: string;
    rearBearingType: string;
    mountingType: MountingType;
}

export default function MotorDiagram({
    shaftDiameter,
    frontBearingType,
    rearBearingType,
    mountingType,
}: MotorDiagramProps) {
    const hasFeet = mountingType === MountingType.Feet || mountingType === MountingType.FeetAndFlange;
    const hasFlange = mountingType === MountingType.Flange || mountingType === MountingType.FeetAndFlange;

    // Параметры сборки
    const bodyX = 130;
    const bodyWidth = 185;
    const shaftWidth = 55;
    const shaftX = hasFlange ? bodyX - shaftWidth - 12 : bodyX - shaftWidth;

    return (
        <div className="w-full flex justify-center items-center py-10 select-none">
            <svg width="600" height="300" viewBox="-120 -20 600 300" className="overflow-visible">
                <defs>
                    <linearGradient id="shaftSteel" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="40%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>

                    <linearGradient id="bornoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>

                    <pattern id="fanMesh" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <circle cx="1.5" cy="1.5" r="1" fill="#000" opacity="0.3" />
                    </pattern>
                </defs>

                {/* 1. ВАЛ И ШПОНКА */}
                <g transform={`translate(${shaftX}, 115)`}>
                    <rect x="0" y="0" width={shaftWidth} height="26" rx="1" fill="url(#shaftSteel)" stroke="#1e293b" />
                    <ellipse cx={shaftWidth} cy="13" rx="3" ry="13" fill="#94a3b8" stroke="#1e293b" />

                    {/* Шпонка */}
                    <g transform="translate(15, -2)">
                        <rect x="0" y="0" width="30" height="4" fill="#64748b" stroke="#1e293b" rx="1" />
                        <line x1="2" y1="1" x2="28" y2="1" stroke="white" opacity="0.3" />
                    </g>

                    {/* Размер вала */}
                    <g stroke="#3b82f6" strokeWidth="1.5" fill="none">
                        <line x1="-12" y1="0" x2="-12" y2="26" />
                        <path d="M-16 0 H-8 M-16 26 H-8" />
                        <text x="-20" y="13" textAnchor="end" dominantBaseline="middle" fill="#2563eb" fontSize="16" fontWeight="900" stroke="none" className="font-mono italic">Ø{shaftDiameter}</text>
                    </g>
                </g>

                {/* 2. ПЕРЕДНИЙ ЩИТ И ФЛАНЕЦ */}
                <rect x={bodyX - 18} y="80" width="18" height="100" rx="3" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
                {hasFlange && (
                    <rect x={bodyX - 32} y="65" width="14" height="130" rx="2" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
                )}

                {/* 3. КОРПУС С РЕБРАМИ */}
                <g transform={`translate(${bodyX}, 75)`}>
                    <rect x="0" y="0" width={bodyWidth} height="110" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                    {[...Array(9)].map((_, i) => (
                        <rect key={i} x="0" y={10 + i * 11} width={bodyWidth} height="4" fill="rgba(0,0,0,0.1)" />
                    ))}
                </g>

                {/* 4. РЫМ-БОЛТ */}
                <g transform={`translate(${bodyX + 115}, 53)`}>
                    <rect x="-8" y="15" width="16" height="8" fill="#475569" stroke="#1e293b" rx="1" />
                    <circle cx="0" cy="5" r="9" fill="none" stroke="#475569" strokeWidth="3" />
                </g>

                {/* 5. БОРНО (Сверху шире, чем снизу) */}
                <g transform={`translate(${bodyX + 15}, 40)`}>
                    {/* Трапеция: основание уже, верх шире */}
                    <path
                        d="M5 35 L0 5 Q0 0 5 0 L75 0 Q80 0 80 5 L75 35 Z"
                        fill="url(#bornoGrad)"
                        stroke="#1e293b"
                        strokeWidth="2"
                    />

                    {/* КРУГЛЫЕ ГЕРМОВВОДЫ */}
                    {[22, 58].map((x) => (
                        <g key={x} transform={`translate(${x}, 15)`}>
                            {/* Тело гермоввода */}
                            <circle r="9" fill="#334155" stroke="#0f172a" strokeWidth="1" />
                            {/* Внутреннее отверстие */}
                            <circle r="4" fill="#000" />
                            {/* Блик на пластике */}
                            <path d="M-4 -4 A 6 6 0 0 1 0 -6" fill="none" stroke="white" opacity="0.2" />
                        </g>
                    ))}
                </g>

                {/* 6. КОЖУХ ВЕНТИЛЯТОРА */}
                <g transform={`translate(${bodyX + bodyWidth}, 75)`}>
                    <rect x="0" y="0" width="35" height="110" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                    <path d="M35 0 Q50 10 50 55 Q50 100 35 110 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                    <rect x="10" y="15" width="20" height="80" fill="url(#fanMesh)" rx="2" />
                </g>

                {/* 7. ЛАПЫ */}
                {hasFeet && (
                    <g transform={`translate(${bodyX + 20}, 185)`}>
                        <path d="M0 0 L-12 30 H155 L143 0 Z" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
                    </g>
                )}

                {/* 8. ПОДШИПНИКИ (Выноски) */}
                <g strokeWidth="2" fill="none">
                    <g stroke="#10b981">
                        <circle cx={bodyX} cy="130" r="20" strokeDasharray="6 4" />
                        <path d={`M${bodyX} 110 V40 H${bodyX - 40}`} strokeWidth="1.5" />
                        <text x={bodyX - 45} y="40" textAnchor="end" dominantBaseline="middle" fill="#059669" fontSize="14" fontWeight="900" stroke="none" className="font-mono">
                            {frontBearingType}
                        </text>
                    </g>
                    <g stroke="#10b981">
                        <circle cx={bodyX + bodyWidth} cy="130" r="20" strokeDasharray="6 4" />
                        <path d={`M${bodyX + bodyWidth} 110 V40 H${bodyX + bodyWidth + 40}`} strokeWidth="1.5" />
                        <text x={bodyX + bodyWidth + 45} y="40" textAnchor="start" dominantBaseline="middle" fill="#059669" fontSize="14" fontWeight="900" stroke="none" className="font-mono">
                            {rearBearingType}
                        </text>
                    </g>
                </g>
            </svg>
        </div>
    );
}
