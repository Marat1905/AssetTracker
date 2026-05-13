import React from 'react';
import { MountingType } from '../types';

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
    // Флаги для выбора отображаемых элементов
    const hasFeet =
        mountingType === MountingType.Feet ||
        mountingType === MountingType.FeetAndFlange ||
        mountingType === MountingType.FeetAndSmallFlange;

    const hasBigFlange =
        mountingType === MountingType.Flange ||
        mountingType === MountingType.FeetAndFlange;

    const hasSmallFlange =
        mountingType === MountingType.SmallFlange ||
        mountingType === MountingType.FeetAndSmallFlange;

    const showNormalFrontCover = !hasBigFlange && !hasSmallFlange;

    return (
        <div className="w-full flex justify-center items-center py-6 select-none">
            <svg
                version="1.1"
                viewBox="-30 0 460 340"   // ← расширено влево на 60px
                className="w-full h-auto max-w-3xl"
                style={{ enableBackground: 'new -60 0 460 340' }}
            >
                <defs>
                    <style>{`
                        .st0 { fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; }
                        .st1 { fill-rule: evenodd; clip-rule: evenodd; fill: #5B5B5B; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; }
                        .st2 { fill-rule: evenodd; clip-rule: evenodd; fill: #4288E3; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; }
                        .st3 { fill: none; }
                        .bearing-leader { stroke: #10b981; stroke-width: 1.5; fill: none; stroke-dasharray: 4 3; }
                        .bearing-text { fill: #059669; font-size: 14px; font-weight: bold; font-family: monospace; }
                        .shaft-dim { stroke: #3b82f6; stroke-width: 1.5; fill: none; }
                        .shaft-text { fill: #2563eb; font-size: 13px; font-weight: bold; font-family: monospace; }
                    `}</style>
                </defs>

                {/* ========== БАЗОВЫЕ ЭЛЕМЕНТЫ (общие для всех типов) ========== */}
                {/* Корпус, вал, борно, вентилятор, подшипники и т.д. (взято из исходного SVG) */}
                <path className="st0" d="M121,39h77c1,0,3,0,3,3l-3,36l0,0h-77l-3-36C118,39,123,39,121,39z" />
                <path className="st1" d="M120,40L120,40c0,1,2,2,4,2s4-1,4-2l0,0c0,0-2,1-4,1S121,40,120,40z" />
                <path className="st0" d="M124,38c-2,0-4,1-4,1c0,1,2,2,4,2s4-1,4-2C128,39,126,38,124,38z" />
                <path className="st1" d="M191,40L191,40c0,1,2,2,4,2s4-1,4-2l0,0c0,0-2,1-4,1S192,40,191,40z" />
                <path className="st0" d="M195,38c-2,0-4,1-4,1c0,1,2,2,4,2s4-1,4-2C199,39,197,38,195,38z M124,35v12 M195,35v12 M119,45h82 M128,45h64 v32l-1,1h-62l-1-1V45z M128,64h64 M143,52c-6,0-11,5-11,12c0,6,5,11,11,11c7,0,12-5,12-11C155,57,150,52,143,52z M176,52 c-6,0-12,5-12,12c0,6,6,11,12,11c7,0,12-5,12-11C188,57,183,52,176,52z M143,51v25 M176,51v25" />
                <path className="st1" d="M125,82h69v3h-69V82z" />
                <path className="st0" d="M125,82l-4-4 M194,82l4-4 M215,77c4,0,7-3,7-7s-3-7-7-7s-7,3-7,7S211,77,215,77z M223,81c3-2,6-6,6-11 c0-8-6-14-14-14c-7,0-14,6-14,14c0,4,3,8,6,11v4h16V81z M215,59v43 M206,70h18 M208,80l2-1h11l1,1" />
                <path className="st1" d="M207,82h16v3h-16V82z" />
                <path className="st0" d="M119,115c0-3,0-6,0-10c25,0,51,0,76,0c1,2,3,3,3,7h-67" />
                <path className="st0" d="M119,109h156v6H119V109z" />
                <polyline className="st0" points="224,86 224,85 231,85 232,88 245,88 " />
                <polyline className="st0" points="267,86 267,85 260,85 259,88 245,88 " />
                <polyline className="st0" points="120,108 123,95 273,95 275,97 " />
                <polyline className="st0" points="120,104 123,91 273,91 275,93 " />
                <polyline className="st0" points="120,100 123,88 273,88 275,90 " />
                <polyline className="st0" points="120,97 123,85 273,85 275,87 " />
                <path className="st0" d="M131,115c0-3-1-6-1-10v9h1" />
                <path className="st0" d="M275,105c-22,0-45,0-68,0c-2,2-3,3-3,7h67" />
                <path className="st0" d="M271,115c0-3,1-6,1-10v9h-1" />
                <path className="st0" d="M353,239c4,0,6-2,6-5V106c0-3-2-5-6-5V239z" />
                <path className="st0" d="M311,87h25c5,0,11,9,17,14c0,46,0,92,0,138c-5,5-12,14-16,14h-26C311,198,311,142,311,87z" />
                <line className="st0" x1="284" y1="110" x2="294" y2="110" />
                <line className="st0" x1="289" y1="103" x2="289" y2="115" />
                <path className="st0" d="M289,112c2,0,3-1,3-2c0-2-1-3-3-3c-1,0-3,1-3,3C286,111,288,112,289,112z" />
                <path className="st0" d="M297,82h11v3h-11V82z" />
                <path className="st0" d="M122,212h150v3H122V212z" />
                <path className="st0" d="M120,212h155v3H120V212z" />
                <path className="st0" d="M122,204h150v2H122V204z" />
                <path className="st0" d="M120,204h155v2H120V204z" />
                <path className="st0" d="M122,195h150v2H122V195z" />
                <path className="st0" d="M120,195h155v2H120V195z" />
                <path className="st0" d="M122,186h150v2H122V186z" />
                <path className="st0" d="M120,186h155v2H120V186z" />
                <path className="st0" d="M122,152h150v2H122V152z" />
                <path className="st0" d="M120,152h155v2H120V152z" />
                <path className="st0" d="M122,143h150v2H122V143z" />
                <path className="st0" d="M120,143h155v2H120V143z" />
                <path className="st0" d="M122,134h150v2H122V134z" />
                <path className="st0" d="M120,134h155v2H120V134z" />
                <path className="st0" d="M122,125h150v3H122V125z" />
                <path className="st0" d="M120,125h155v3H120V125z" />
                <line className="st0" x1="108" y1="116" x2="105" y2="116" />
                <line className="st0" x1="108" y1="112" x2="105" y2="112" />
                <line className="st0" x1="108" y1="110" x2="108" y2="119" />
                <path className="st0" d="M110,110h-4c-1,0-1,0-1,1v7c0,0,0,1,1,1h4V110z" />
                <line className="st0" x1="117" y1="116" x2="110" y2="116" />
                <line className="st0" x1="121" y1="114" x2="102" y2="114" />
                <path className="st0" d="M110,105h7v18h-7V105z" />
                <path className="st0" d="M119,112h-2v5h2V112z" />
                <path className="st0" d="M119,123h156v-8H119V123z" />
                <line className="st0" x1="112" y1="243" x2="115" y2="245" />
                <line className="st0" x1="112" y1="97" x2="115" y2="95" />
                <line className="st0" x1="112" y1="235" x2="112" y2="243" />
                <line className="st0" x1="112" y1="123" x2="112" y2="217" />
                <line className="st0" x1="112" y1="97" x2="112" y2="105" />
                <line className="st0" x1="115" y1="123" x2="115" y2="217" />
                <path className="st0" d="M120,95c-2,0-3,0-5,0v10" />
                <line className="st0" x1="118" y1="224" x2="118" y2="117" />
                <line className="st0" x1="118" y1="112" x2="118" y2="95" />
                <path className="st0" d="M110,222h-2v9h2V222z" />
                <path className="st0" d="M108,224h-3l0,0v4c0,1,0,1,0,1h3V224z" />
                <path className="st0" d="M109,222h-4l0,0v8c0,1,0,1,0,1h4c0,0,1,0,1-1v-8H109z" />
                <line className="st0" x1="101" y1="226" x2="121" y2="226" />
                <path className="st0" d="M119,224h-2v4h2V224z" />
                <polygon className="st0" points="162,177 268,177 268,180 125,180 125,177 " />
                <polygon className="st0" points="162,168 268,168 268,170 125,170 125,168 " />
                <polygon className="st0" points="162,160 125,160 125,162 268,162 268,160 " />
                <polygon className="st0" points="158,168 128,168 128,170 266,170 266,168 " />
                <polygon className="st0" points="158,160 128,160 128,162 266,162 266,160 " />
                <polygon className="st0" points="158,177 266,177 266,180 128,180 128,177 " />
                <path className="st0" d="M277,84h32c1,0,2,1,2,3v83v83c0,1-1,2-2,2h-32c-1,0-2-1-2-2v-83V87C275,85,276,84,277,84z" />
                <path className="st0" d="M119,225c0,4,0,7,0,10c26,0,51,0,76,0c1-1,3-3,3-7h-67" />
                <path className="st0" d="M119,232h156v-7H119V232z" />
                <polyline className="st0" points="120,233 123,245 273,245 275,243 " />
                <polyline className="st0" points="120,236 123,250 273,250 275,247 " />
                <polyline className="st0" points="120,241 123,252 273,252 275,250 " />
                <polyline className="st0" points="120,244 123,256 273,256 275,253 " />
                <path className="st0" d="M131,225c0,3-1,6-1,10v-9h1" />
                <path className="st0" d="M275,235c-22,0-45,0-68,0c-2-1-3-3-3-7h67" />
                <path className="st0" d="M271,225c0,3,1,6,1,10v-9h-1" />
                <path className="st0" d="M119,218h156v7H119V218z" />
                <path className="st0" d="M120,245c-2,0-3,0-5,0v-10" />
                <line className="st0" x1="118" y1="228" x2="118" y2="245" />
                <line className="st0" x1="82" y1="182" x2="79" y2="182" />
                <path className="st0" d="M110,217h7v18h-7V217z" />
                <path className="st0" d="M110,217h7v18h-7V217z" />
                <path className="st0" d="M36,156h40v3H36V156z" />
                <polygon className="st0" points="82,158 76,158 76,159 36,159 36,158 34,158 34,182 82,182 " />
                <path className="st0" d="M289,233c2,0,3-1,3-3c0-1-1-2-3-2c-1,0-3,1-3,2C286,232,288,233,289,233z" />
                <rect className="st3" width="400" height="340" />

                {/* ========== ПЕРЕДНЯЯ КРЫШКА (заменяемая) ========== */}
                {showNormalFrontCover && (
                    <g id="normal-front-cover">
                        <line className="st0" x1="112" y1="242" x2="95" y2="242" />
                        <line className="st0" x1="112" y1="97" x2="95" y2="97" />
                        <path className="st0" d="M84 156zm0 0l-3 0 0 27 3 0 0 -28z" />
                        <path className="st0" d="M84 194zm0 0l6 0 0 -49 -6 0 0 49z" />
                        <polygon className="st0" points="95,134 90,134 90,206 95,206 " />
                        <path className="st0" d="M100 138zm0 0l-5 0 0 64 5 0 0 -64z" />
                        <path className="st0" d="M100 130zm0 0l-5 0 0 79 5 0 0 -79z" />
                        <path className="st0" d="M100 102zm0 0l-5 0 0 136 5 0 0 -136z" />
                        <path className="st0" d="M104 97zm0 0l-9 0 0 145 9 0 0 -145z" />
                    </g>
                )}

                {/* ========== БОЛЬШОЙ ФЛАНЕЦ ========== */}
                {hasBigFlange && (
                    <g id="big-flange">
                        <polyline className="st0" points="112,243 97,243 94,245 " />
                        <polyline className="st0" points="112,97 97,97 94,95 " />
                        <path className="st2" d="M78 105zm0 0l4 0 0 130 -4 0 0 -130z" />
                        <path className="st2" d="M94 74zm0 0l-12 0 0 192 12 0 0 -192z" />
                    </g>
                )}

                {/* ========== МАЛЫЙ ФЛАНЕЦ ========== */}
                {hasSmallFlange && (
                    <g id="small-flange">
                        <polyline className="st0" points="112,243 97,243 94,245 " />
                        <polyline className="st0" points="112,97 97,97 94,95 " />
                        <path className="st2" d="M94,95H82v150h12V95z" />
                    </g>
                )}

                {/* ========== ЛАПЫ ========== */}
                {hasFeet && (
                    <g id="feet">
                        <path className="st2" d="M116 255zm0 0l168 0 0 14 -168 0 0 -14z" />
                        <path className="st2" d="M145 225zm0 0l112 0 0 30 -112 0 0 -30z" />
                        <path className="st2" d="M159 239zm0 0l5 0 0 16 -5 0 0 -16z" />
                        <path className="st2" d="M238 239zm0 0l5 0 0 16 -5 0 0 -16z" />
                    </g>
                )}

                {/* ========== ДОБАВЛЕННАЯ РАЗМЕТКА: диаметр вала и подшипники ========== */}
                {/* Диаметр вала – вертикальная размерная линия слева от вала */}
                <g id="shaft-dimension">
                    {/* Выносные линии от верхней и нижней граней вала */}
                    <line className="shaft-dim" x1="28" y1="158" x2="22" y2="158" />
                    <line className="shaft-dim" x1="28" y1="182" x2="22" y2="182" />
                    {/* Вертикальная размерная линия */}
                    <line className="shaft-dim" x1="22" y1="158" x2="22" y2="182" />
                    {/* Стрелки */}
                    <polygon className="shaft-dim" points="22,158 19,163 25,163" fill="#3b82f6" />
                    <polygon className="shaft-dim" points="22,182 19,177 25,177" fill="#3b82f6" />
                    {/* Текст размера – теперь левее, с отступом от края */}
                    <text x="-30" y="172" textAnchor="start" className="shaft-text">Ø{shaftDiameter} мм</text>
                </g>

                {/* Передний подшипник – кружок со смещением вверх (не по центру вала) */}
                <g id="front-bearing">
                    {/* Пунктирная окружность вокруг переднего подшипника (центр x=128, y=114) */}
                    <circle cx="100" cy="170" r="15" className="bearing-leader" />
                    {/* Линия-выноска вверх */}
                    <line className="bearing-leader" x1="100" y1="155" x2="100" y2="35" />
                    <circle cx="100" cy="35" r="2" fill="#10b981" />
                    {/* Текст подшипника – ещё выше */}
                    <text x="100" y="28" textAnchor="middle" className="bearing-text">{frontBearingType}</text>
                </g>

                {/* Задний подшипник – аналогично, центр x=305, y=114 */}
                <g id="rear-bearing">
                    <circle cx="290" cy="170" r="15" className="bearing-leader" />
                    <line className="bearing-leader" x1="290" y1="155" x2="290" y2="35" />
                    <circle cx="290" cy="35" r="2" fill="#10b981" />
                    <text x="290" y="28" textAnchor="middle" className="bearing-text">{rearBearingType}</text>
                </g>

            </svg>
        </div>
    );
}