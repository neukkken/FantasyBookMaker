import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const IDIOMAS = [
  { code: 'es', label: 'ES', nombre: 'Español' },
  { code: 'en', label: 'EN', nombre: 'English' }
]

const SECCIONES = [
  { id: 'idioma', labelKey: 'settings.idioma' },
  { id: 'apariencia', labelKey: 'settings.apariencia' },
  { id: 'escritura', labelKey: 'settings.escritura' }
]

export default function SettingsModal({ cerrado }) {
  const { t, i18n } = useTranslation()
  const [seccion, setSeccion] = useState('idioma')

  const idiomaActual = i18n.language?.startsWith('es') ? 'es' : 'en'

  const cambiarIdioma = (code) => {
    i18n.changeLanguage(code)
    window.api.establecerIdioma(code)
    document.documentElement.lang = code
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16"
         onClick={cerrado}>
      <div className="w-full max-w-lg bg-gothic-surface border border-gothic-gold/30 rounded-sm shadow-gothic-xl"
           style={{ backdropFilter: 'blur(12px)' }}
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gothic-gold/15">
          <span className="text-xs tracking-[0.2em] uppercase font-serif text-gothic-gold-light">
            {t('settings.titulo')}
          </span>
          <button onClick={cerrado}
            className="text-gothic-parchment/30 hover:text-gothic-parchment text-xs transition-colors">
            ✕
          </button>
        </div>

        <div className="flex gap-0">
          <div className="w-28 shrink-0 border-r border-gothic-gold/15 py-2">
            {SECCIONES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeccion(s.id)}
                className={`w-full text-left px-3 py-1.5 text-[11px] font-serif transition-colors
                  ${seccion === s.id
                    ? 'text-gothic-gold-light bg-gothic-gold/10 border-r-2 border-gothic-gold'
                    : 'text-gothic-parchment/50 hover:text-gothic-parchment/80'}`}
              >
                {t(s.labelKey)}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 min-h-[200px]">
            {seccion === 'idioma' && (
              <div className="space-y-3">
                <p className="text-[11px] text-gothic-parchment/50 font-serif mb-3">
                  {t('settings.descIdioma')}
                </p>
                {IDIOMAS.map(({ code, label, nombre }) => (
                  <button
                    key={code}
                    onClick={() => cambiarIdioma(code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-serif transition-colors
                      ${idiomaActual === code
                        ? 'bg-gothic-gold/15 text-gothic-gold-light border border-gothic-gold/30'
                        : 'text-gothic-parchment/70 hover:bg-gothic-gold/5 hover:text-gothic-parchment border border-transparent'}`}
                  >
                    <span className={`w-7 h-5 flex items-center justify-center rounded text-[10px] font-bold uppercase
                      ${idiomaActual === code
                        ? 'bg-gothic-gold/20 text-gothic-gold-light'
                        : 'bg-gothic-gold/5 text-gothic-gold/40'}`}>
                      {label}
                    </span>
                    <span>{nombre}</span>
                    {idiomaActual === code && (
                      <span className="ml-auto text-gothic-gold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {seccion === 'apariencia' && (
              <p className="text-[11px] text-gothic-parchment/30 italic font-serif">
                {t('settings.proximamente')}
              </p>
            )}
            {seccion === 'escritura' && (
              <p className="text-[11px] text-gothic-parchment/30 italic font-serif">
                {t('settings.proximamente')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
