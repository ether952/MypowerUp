import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, XCircle } from 'lucide-react';

export default function ItemActionMenu({
  onEdit,
  onDelete,
  variant = 'purple', // 'purple' | 'cyan' | 'emerald'
  itemName = 'ítem',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleOpen = (e) => {
    e.stopPropagation();
    if (!isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Si hay menos de 120px abajo y más espacio arriba, abrir hacia arriba
      if (spaceBelow < 120 && rect.top > 100) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onEdit) onEdit();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onDelete) onDelete();
  };

  // Color accents based on variant
  const borderAccent =
    variant === 'cyan'
      ? 'border-cyan-500/40 shadow-cyan-500/20'
      : variant === 'emerald'
      ? 'border-emerald-500/40 shadow-emerald-500/20'
      : 'border-purple-500/40 shadow-purple-500/20';

  const editHover =
    variant === 'cyan'
      ? 'hover:text-neon-cyan hover:bg-neon-cyan/10'
      : variant === 'emerald'
      ? 'hover:text-emerald-400 hover:bg-emerald-500/10'
      : 'hover:text-neon-purple hover:bg-neon-purple/10';

  const buttonHover =
    variant === 'cyan'
      ? 'hover:text-neon-cyan hover:bg-cyan-500/15'
      : variant === 'emerald'
      ? 'hover:text-emerald-400 hover:bg-emerald-500/15'
      : 'hover:text-neon-purple hover:bg-purple-500/15';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`p-1.5 rounded-lg text-neutral-400 ${buttonHover} transition-colors cursor-pointer select-none focus:outline-none`}
        title={`Opciones de ${itemName}`}
        aria-label={`Opciones de ${itemName}`}
      >
        <MoreVertical className="w-4 h-4 stroke-[2.5]" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } w-36 bg-[#0E0926]/95 backdrop-blur-2xl border ${borderAccent} rounded-xl shadow-2xl py-1.5 z-50 font-mono text-xs divide-y divide-white/5 animate-fade-in-up`}
        >
          {onEdit && (
            <button
              type="button"
              onClick={handleEditClick}
              className={`w-full px-3 py-2 text-left text-neutral-200 ${editHover} flex items-center gap-2.5 transition-colors cursor-pointer`}
            >
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              <span>Editar</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full px-3 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
