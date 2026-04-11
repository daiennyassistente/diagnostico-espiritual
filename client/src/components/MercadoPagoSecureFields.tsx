import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface MercadoPagoSecureFieldsProps {
  publicKey: string;
  onPaymentReady?: (token: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
}

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

export function MercadoPagoSecureFields({
  publicKey,
  onPaymentReady,
  onError,
  isLoading = false,
}: MercadoPagoSecureFieldsProps) {
  const [cardholderName, setCardholderName] = useState("");
  const [cardholderEmail, setCardholderEmail] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fieldsReady, setFieldsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mercadopagoRef = useRef<any>(null);

  useEffect(() => {
    // Aguardar o script global do Mercado Pago ser carregado
    const checkMercadoPago = setInterval(() => {
      if (window.MercadoPago) {
        clearInterval(checkMercadoPago);
        initializeMercadoPago();
      }
    }, 100);

    return () => clearInterval(checkMercadoPago);
  }, []);

  const initializeMercadoPago = async () => {
    try {
      if (!window.MercadoPago) {
        throw new Error("MercadoPago SDK não carregado");
      }

      // Inicializar o MercadoPago com a chave pública
      const mp = new window.MercadoPago(publicKey, {
        locale: "pt-BR",
      });

      mercadopagoRef.current = mp;

      // Criar os Secure Fields
      const cardNumberElement = mp.fields.create("cardNumber", {
        placeholder: "Número do cartão",
      });

      const expirationDateElement = mp.fields.create("expirationDate", {
        placeholder: "MM/YY",
      });

      const securityCodeElement = mp.fields.create("securityCode", {
        placeholder: "CVC",
      });

      // Montar os campos no DOM
      if (containerRef.current) {
        cardNumberElement.mount(containerRef.current.querySelector("#cardNumber") || "");
        expirationDateElement.mount(containerRef.current.querySelector("#expirationDate") || "");
        securityCodeElement.mount(containerRef.current.querySelector("#securityCode") || "");
      }

      setFieldsReady(true);
    } catch (error) {
      console.error("Erro ao inicializar MercadoPago:", error);
      onError?.(`Erro ao carregar campos de pagamento: ${error}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mercadopagoRef.current) {
      onError?.("Campos de pagamento não inicializados");
      return;
    }

    if (!cardholderName || !cardholderEmail || !identificationNumber) {
      onError?.("Por favor, preencha todos os campos");
      return;
    }

    setIsProcessing(true);

    try {
      // Criar o token do cartão usando os Secure Fields
      const { token } = await mercadopagoRef.current.fields.createCardToken({
        cardholderName,
        cardholderEmail,
        identificationNumber,
        identificationType: "CPF", // Assumindo CPF para Brasil
      });

      if (token) {
        onPaymentReady?.(token);
      } else {
        onError?.("Erro ao gerar token do cartão");
      }
    } catch (error) {
      console.error("Erro ao processar cartão:", error);
      onError?.(`Erro ao processar cartão: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-white">
      <h2 className="text-xl font-semibold mb-6 text-[#4A3F35]">
        Informações do Cartão
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos de Secure Fields */}
        <div ref={containerRef} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4A3F35] mb-2">
              Número do Cartão
            </label>
            <div
              id="cardNumber"
              className="border border-gray-300 rounded-lg p-3 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4A3F35] mb-2">
                Validade
              </label>
              <div
                id="expirationDate"
                className="border border-gray-300 rounded-lg p-3 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A3F35] mb-2">
                CVC
              </label>
              <div
                id="securityCode"
                className="border border-gray-300 rounded-lg p-3 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Campos adicionais */}
        <div>
          <label className="block text-sm font-medium text-[#4A3F35] mb-2">
            Nome do Titular
          </label>
          <Input
            type="text"
            placeholder="Nome completo"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            disabled={isProcessing || isLoading}
            className="border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A3F35] mb-2">
            E-mail
          </label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={cardholderEmail}
            onChange={(e) => setCardholderEmail(e.target.value)}
            disabled={isProcessing || isLoading}
            className="border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A3F35] mb-2">
            CPF
          </label>
          <Input
            type="text"
            placeholder="000.000.000-00"
            value={identificationNumber}
            onChange={(e) => setIdentificationNumber(e.target.value)}
            disabled={isProcessing || isLoading}
            maxLength={14}
            className="border-gray-300"
          />
        </div>

        <Button
          type="submit"
          disabled={!fieldsReady || isProcessing || isLoading}
          className="w-full bg-[#3E342C] hover:bg-[#2a251f] text-white"
        >
          {isProcessing || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Confirmar Pagamento"
          )}
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Seus dados são seguros. Usamos criptografia SSL/TLS e Secure Fields do Mercado Pago.
      </p>
    </Card>
  );
}
