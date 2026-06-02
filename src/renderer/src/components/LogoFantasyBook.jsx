export default function LogoFantasyBook({ size = 32, className = '' }) {
  return (
    <svg
      viewBox="0 0 200 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size * (200 / 44), height: size }}
    >
      <defs>
        <linearGradient id="lg-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0c060" />
          <stop offset="50%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#a08030" />
        </linearGradient>
        <linearGradient id="lg-oro-claro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0e0a0" />
          <stop offset="100%" stopColor="#d4b060" />
        </linearGradient>
        <linearGradient id="lg-pergamino" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5eed6" />
          <stop offset="100%" stopColor="#e0d5b8" />
        </linearGradient>
        <linearGradient id="lg-sangre" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c41010" />
          <stop offset="100%" stopColor="#880808" />
        </linearGradient>
        <filter id="sombra-oro">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#c9a84c" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Arco gótico exterior */}
      <path d="M8 40V16C8 8 14 2 22 2h4C30 2 32 0 36 0c4 0 6 2 10 2h4c8 0 14 6 14 14v24"
            stroke="url(#lg-oro)" strokeWidth="1.2" fill="none" opacity="0.25" />

      {/* Libro abierto — portada izquierda */}
      <path d="M14 36V14c0-2 1.5-3.5 4-3.5h10c2.5 0 4 1.5 4 3.5v22"
            fill="url(#lg-pergamino)" stroke="url(#lg-oro)" strokeWidth="0.8" filter="url(#sombra-oro)" />
      {/* Portada derecha */}
      <path d="M32 36V14c0-2 1.5-3.5 4-3.5h10c2.5 0 4 1.5 4 3.5v22"
            fill="url(#lg-pergamino)" stroke="url(#lg-oro)" strokeWidth="0.8" filter="url(#sombra-oro)" />

      {/* Lomo central */}
      <line x1="31.5" y1="10" x2="31.5" y2="36" stroke="#a08030" strokeWidth="1.5" />
      <line x1="32.5" y1="10" x2="32.5" y2="36" stroke="#a08030" strokeWidth="0.5" opacity="0.5" />

      {/* Costuras del lomo */}
      <circle cx="32" cy="13" r="0.8" fill="#a08030" opacity="0.5" />
      <circle cx="32" cy="18" r="0.8" fill="#a08030" opacity="0.5" />
      <circle cx="32" cy="23" r="0.8" fill="#a08030" opacity="0.5" />
      <circle cx="32" cy="28" r="0.8" fill="#a08030" opacity="0.5" />
      <circle cx="32" cy="33" r="0.8" fill="#a08030" opacity="0.5" />

      {/* Líneas de texto — página izquierda */}
      <rect x="18" y="15" width="10" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />
      <rect x="18" y="17.5" width="6" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />
      <rect x="18" y="20" width="10" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />
      <rect x="18" y="22.5" width="8" height="0.8" rx="0.4" fill="#8a7337" opacity="0.25" />
      <rect x="18" y="25" width="10" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />
      <rect x="18" y="27.5" width="5" height="0.8" rx="0.4" fill="#8a7337" opacity="0.2" />
      <rect x="18" y="30" width="9" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />

      {/* Líneas de texto — página derecha */}
      <rect x="36" y="15" width="10" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />
      <rect x="36" y="17.5" width="7" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />
      <rect x="36" y="20" width="10" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />
      <rect x="36" y="22.5" width="9" height="0.8" rx="0.4" fill="#8a7337" opacity="0.25" />
      <rect x="36" y="25" width="10" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />
      <rect x="36" y="27.5" width="4" height="0.8" rx="0.4" fill="#8a7337" opacity="0.2" />
      <rect x="36" y="30" width="8" height="0.8" rx="0.4" fill="#8a7337" opacity="0.3" />

      {/* Cinta marcadora */}
      <path d="M30 36v-4c0-1 1-2 2-2s2 1 2 2v4"
            fill="url(#lg-sangre)" />
      <path d="M30 32c0-1 1-2 2-2s2 1 2 2"
            fill="url(#lg-sangre)" stroke="#660000" strokeWidth="0.4" />

      {/* Pluma */}
      <g opacity="0.7">
        <path d="M48 8c-2 3-5 8-6 12s-1 6-1 6"
              stroke="url(#lg-oro)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M42 24c0 0 1-1 3-1s3 1 3-1"
              stroke="url(#lg-oro)" strokeWidth="0.8" fill="none" />
        <path d="M48 8l2-3c0.5-0.8 1.5-1 2-0.5s0.3 1.5-0.5 2l-3 2"
              fill="url(#lg-oro-claro)" opacity="0.6" />
      </g>

      {/* Esquinas metálicas — superior izquierda */}
      <path d="M12 6L8 6 8 10" stroke="url(#lg-oro)" strokeWidth="1" fill="none" opacity="0.4" />
      <circle cx="8" cy="6" r="1.5" fill="url(#lg-oro)" opacity="0.3" />
      {/* Esquinas metálicas — superior derecha */}
      <path d="M52 6L56 6 56 10" stroke="url(#lg-oro)" strokeWidth="1" fill="none" opacity="0.4" />
      <circle cx="56" cy="6" r="1.5" fill="url(#lg-oro)" opacity="0.3" />

      {/* Letra capital decorativa */}
      <text x="18" y="14" fontFamily="'Playfair Display', Georgia, serif" fontSize="5"
            fill="url(#lg-sangre)" fontWeight="bold" fontStyle="italic" opacity="0.6">F</text>

      {/* Texto: FANTASYBOOK */}
      <text x="70" y="24" fontFamily="'Playfair Display', Georgia, serif" fontSize="16"
            fill="url(#lg-oro)" fontWeight="bold" letterSpacing="4" filter="url(#sombra-oro)">
        FANTASY
      </text>
      <text x="70" y="38" fontFamily="'Playfair Display', Georgia, serif" fontSize="16"
            fill="url(#lg-oro)" fontWeight="bold" letterSpacing="4" filter="url(#sombra-oro)">
        BOOK
      </text>

      {/* Línea decorativa bajo el texto */}
      <line x1="70" y1="30" x2="190" y2="30" stroke="url(#lg-oro)" strokeWidth="0.5" opacity="0.3" />
      <circle cx="70" cy="30" r="1" fill="url(#lg-oro)" opacity="0.4" />
      <circle cx="190" cy="30" r="1" fill="url(#lg-oro)" opacity="0.4" />
      <circle cx="130" cy="30" r="0.6" fill="url(#lg-oro)" opacity="0.25" />
    </svg>
  )
}
