import React from 'react';

interface BearingIconProps extends React.SVGProps<SVGSVGElement> { }

const BearingIcon: React.FC<BearingIconProps> = (props) => {
    return (
        <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            style={{ '--fill-color': 'none', '--stroke-color': 'currentColor' } as React.CSSProperties}
            {...props}
        >
            <style>
                {`
          .bearing-fill { fill: var(--fill-color); }
          .bearing-stroke { stroke: var(--stroke-color); }
          .bearing-stroke-main { stroke-width: 5px; }
          .bearing-stroke-thin { stroke-width: 3px; }
        `}
            </style>

            {/* Внешнее кольцо */}
            <circle cx="50" cy="50" r="48" className="bearing-stroke bearing-stroke-main" fill="none" />
            <circle cx="50" cy="50" r="46" className="bearing-fill bearing-stroke bearing-stroke-thin" />

            {/* Внутреннее кольцо */}
            <circle cx="50" cy="50" r="22" className="bearing-stroke bearing-stroke-main" fill="none" />
            <circle cx="50" cy="50" r="20" className="bearing-fill bearing-stroke bearing-stroke-thin" />

            {/* Шарики */}
            <g className="bearing-fill bearing-stroke bearing-stroke-thin">
                <circle cx="50" cy="12" r="6" />
                <circle cx="50" cy="88" r="6" />
                <circle cx="12" cy="50" r="6" />
                <circle cx="88" cy="50" r="6" />
                <circle cx="28" cy="28" r="6" />
                <circle cx="72" cy="28" r="6" />
                <circle cx="28" cy="72" r="6" />
                <circle cx="72" cy="72" r="6" />
            </g>
        </svg>
    );
};

export default BearingIcon;