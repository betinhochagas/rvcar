import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { useSiteConfig } from "@/contexts/SiteConfigContext";
import ConsultantModal from "./ConsultantModal";

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getConfig } = useSiteConfig();
  
  // Configurações dinâmicas
  const buttonText = getConfig('button_whatsapp_text', '');

  useEffect(() => {
    // Verifica se o usuário já fechou o botão anteriormente (sessão)
    const wasClosed = sessionStorage.getItem("whatsappButtonClosed");
    if (wasClosed === "true") {
      setIsClosed(true);
      return;
    }

    // Mostra o botão após 10 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClosed(true);
    // Salva no sessionStorage que o usuário fechou (dura até fechar o navegador)
    sessionStorage.setItem("whatsappButtonClosed", "true");
  };

  // Não renderiza se foi fechado, ainda não está visível, ou não tem texto configurado
  if (isClosed || !isVisible || !buttonText) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        {/* Botão principal */}
        <button
          onClick={handleClick}
          className="group relative bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 px-6 py-4 pr-12"
          aria-label="Falar com um consultor"
        >
          {/* Ícone do WhatsApp */}
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </div>

          {/* Texto */}
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm whitespace-nowrap">
              {buttonText}
            </span>
            <span className="text-xs text-white/90">
              Estamos online!
            </span>
          </div>

          {/* Indicador de notificação */}
          <span className="absolute top-2 right-14 w-3 h-3 bg-red-500 rounded-full animate-pulse" />

          {/* Botão de fechar */}
          <div
            onClick={handleClose}
            className="absolute top-2 right-2 w-6 h-6 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            role="button"
            aria-label="Fechar"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClose(e as React.KeyboardEvent<HTMLDivElement>);
              }
            }}
          >
            <X className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Modal de Consultor */}
      <ConsultantModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default WhatsAppButton;
