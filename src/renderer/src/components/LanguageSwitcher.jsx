import { useTranslation } from 'react-i18next'

const IDIOMAS = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' }
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const actual = i18n.language?.startsWith('es') ? 'es' : 'en'

  const handleChange = (code) => {
    i18n.changeLanguage(code)
    window.api.establecerIdioma(code)
    document.documentElement.lang = code
  }

  return (
    <div className="flex gap-0.5">
      {IDIOMAS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider transition-colors
            ${actual === code
              ? 'bg-gothic-gold/20 text-gothic-gold-light'
              : 'text-gothic-gold/30 hover:text-gothic-gold/60 hover:bg-gothic-gold/5'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
