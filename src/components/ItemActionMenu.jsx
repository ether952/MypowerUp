import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, XCircle } from 'lucide-react';

export default function ItemActionMenu({
  onEdit,
  onDelete,
  variant = 'purple',
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

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer select-none focus:outline-none"
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
          } w-36 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-xl py-1.5 z-50 font-mono text-xs divide-y divide-zinc-100 animate-fade-in-up`}
        >
          {onEdit && (
            <button
              type="button"
              onClick={handleEditClick}
              className="w-full px-3 py-2 text-left text-zinc-700 hover:text-black hover:bg-zinc-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 shrink-0 text-zinc-800" />
              <span>Editar</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full px-3 py-2 text-left text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
