import React from 'react';
import { 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  Shield, 
  ExternalLink,
  Zap,
  Sparkles
} from 'lucide-react';

export default function Footer({ onOpenAuth }) {
  return (
    <footer className="w-full bg-[#FAFAFA] text-zinc-600 font-sans border-t border-zinc-200 relative z-20 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 items-start">
          
          {/* Columna 1: Marca, Descripción & Redes */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-2xl font-extrabold font-display tracking-tight text-zinc-900 uppercase">
                MYPOWERUP
              </span>
            </div>

            <p className="text-zinc-500 text-xs sm:text-sm font-sans leading-relaxed max-w-sm">
              La plataforma minimalista para gestionar tus entrenamientos, nutrición de precisión y evolución física en tiempo real.
            </p>

            {/* Redes Sociales */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 hover:text-black flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 hover:text-black flex items-center justify-center transition-all duration-200 shadow-sm group"
              >
                <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.87-4.47V8.72A8.18 8.18 0 0 0 20.3 10V6.69h-.71z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 hover:text-black flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

          </div>

          {/* Columna 2: Plataforma */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900">
              Plataforma
            </h3>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <span className="hover:text-black transition-colors cursor-pointer">
                  Funciones
                </span>
              </li>
              <li>
                <span className="hover:text-black transition-colors cursor-pointer">
                  Testimonios
                </span>
              </li>
              <li>
                <span className="hover:text-black transition-colors cursor-pointer">
                  Precios
                </span>
              </li>
              <li>
                <span className="hover:text-black transition-colors cursor-pointer">
                  Preguntas frecuentes
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900">
              Contacto
            </h3>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <a 
                  href="mailto:admin@mypowerup.app" 
                  className="hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>admin@mypowerup.app</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/5491136845415" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>+54 9 11 3684-5415</span>
                </a>
              </li>
              <li>
                <span className="hover:text-black transition-colors cursor-pointer flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Políticas de privacidad</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Descargá la App */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900">
              Descargá la App
            </h3>
            
            <div className="flex flex-col gap-2.5">
              
              {/* Badge Google Play */}
              <button
                type="button"
                className="w-full max-w-[200px] px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-400 transition-all flex items-center gap-3 group text-left cursor-pointer shadow-sm"
              >
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186c-.37-.306-.61-.767-.61-1.286V3.1c0-.52.24-.98.61-1.286z" fill="#00D7FE"/>
                  <path d="M17.184 8.608L5.05 1.606c-.456-.263-.984-.287-1.44-.092l10.182 10.486 3.392-3.392z" fill="#00EB84"/>
                  <path d="M13.792 12L3.61 22.486c.456.195.984.17 1.44-.092l12.134-7.002-3.392-3.392z" fill="#FF3743"/>
                  <path d="M20.574 10.559l-3.39 1.441L13.792 12l3.392 3.392 3.39-1.441c1.173-.678 1.173-1.786 0-2.464l-.001.072z" fill="#FFA800"/>
                </svg>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-mono leading-none">
                    Disponible en
                  </span>
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-black transition-colors font-sans leading-tight">
                    Google Play
                  </span>
                </div>
              </button>

              {/* Badge App Store */}
              <button
                type="button"
                className="w-full max-w-[200px] px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-400 transition-all flex items-center gap-3 group text-left cursor-pointer shadow-sm"
              >
                <svg className="w-6 h-6 flex-shrink-0 fill-current text-zinc-900 group-hover:text-black transition-colors" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.11.64-2.79 1.44-.59.68-1.11 1.77-.97 2.87 1.07.08 2.16-.54 2.77-1.21z"/>
                </svg>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-mono leading-none">
                    Descárgalo en el
                  </span>
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-black transition-colors font-sans leading-tight">
                    App Store
                  </span>
                </div>
              </button>

            </div>

          </div>

        </div>

        {/* Separador inferior y Copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500 text-center sm:text-left">
          <p>© 2026 MyPowerUp App. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-black transition-colors cursor-pointer">Términos de servicio</span>
            <span>•</span>
            <span className="hover:text-black transition-colors cursor-pointer">Privacidad</span>
            <span>•</span>
            <span className="hover:text-black transition-colors cursor-pointer">Seguridad</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
