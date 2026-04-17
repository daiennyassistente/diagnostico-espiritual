import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  className?: string;
}

const DEFAULT_PHONE = '5511999999999'; // Número padrão de suporte
const DEFAULT_MESSAGE = 'Olá! Gostaria de receber suporte sobre o Diagnóstico Espiritual.';

export function WhatsAppButton({
  phoneNumber = DEFAULT_PHONE,
  message = DEFAULT_MESSAGE,
  position = 'bottom-right',
  className = '',
}: WhatsAppButtonProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-full
          bg-green-500 hover:bg-green-600 text-white
          shadow-lg hover:shadow-xl transition-all duration-300
          font-semibold text-sm
          ${isHovering ? 'scale-110' : 'scale-100'}
        `}
        title="Clique para abrir WhatsApp"
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline">Suporte</span>
      </button>

      {/* Tooltip */}
      {isHovering && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          Clique para falar conosco
        </div>
      )}
    </div>
  );
}
