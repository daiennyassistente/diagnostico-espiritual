import { Send } from 'lucide-react';
import { useState } from 'react';

interface WhatsAppReferralButtonProps {
  phoneNumber?: string;
  message?: string;
  label?: string;
  className?: string;
}

const DEFAULT_PHONE = '5585984463738'; // Número de encaminhamento
const DEFAULT_MESSAGE = 'Olá! Gostaria de ser encaminhado para receber mais informações sobre o Diagnóstico Espiritual.';

export function WhatsAppReferralButton({
  phoneNumber = DEFAULT_PHONE,
  message = DEFAULT_MESSAGE,
  label = 'Encaminhar para WhatsApp',
  className = '',
}: WhatsAppReferralButtonProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={className}>
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          flex items-center justify-center gap-2 px-6 py-3 rounded-lg
          bg-green-500 hover:bg-green-600 text-white
          shadow-md hover:shadow-lg transition-all duration-300
          font-semibold text-sm
          ${isHovering ? 'scale-105' : 'scale-100'}
        `}
        title={label}
      >
        <Send size={18} />
        <span>{label}</span>
      </button>
    </div>
  );
}
