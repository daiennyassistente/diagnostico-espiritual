/**
 * Transaction Control Module
 * Gerencia o fluxo de pagamento PIX com bloqueio de duplicação
 */

import {
  getTransactionControl,
  createTransactionControl,
  markTransactionAsProcessed,
  markTransactionEmailSent,
} from "./db";

/**
 * Verifica se uma transação já foi processada
 * Retorna true se já foi processada, false caso contrário
 */
export async function isTransactionAlreadyProcessed(transactionId: string): Promise<boolean> {
  try {
    const transaction = await getTransactionControl(transactionId);
    if (!transaction) {
      return false; // Transação não existe, não foi processada
    }
    return transaction.processed === 1; // Retorna true se processed = 1
  } catch (error) {
    console.error(`[Transaction Control] Erro ao verificar transação ${transactionId}:`, error);
    return false;
  }
}

/**
 * Cria um novo registro de transação
 */
export async function createNewTransaction(
  transactionId: string,
  quizId: string,
  resultId: number,
  leadId: number
): Promise<void> {
  try {
    await createTransactionControl({
      transactionId,
      resultId,
      quizId,
      leadId,
      status: "pending",
      processed: 0,
      emailSent: 0,
      productReleased: 0,
    });
    console.log(`[Transaction Control] Novo registro de transação criado: ${transactionId}`);
  } catch (error) {
    console.error(`[Transaction Control] Erro ao criar transação ${transactionId}:`, error);
    throw error;
  }
}

/**
 * Marca uma transação como processada após email enviado
 */
export async function finalizeTransaction(transactionId: string): Promise<void> {
  try {
    // Marcar email como enviado
    await markTransactionEmailSent(transactionId);
    console.log(`[Transaction Control] Email marcado como enviado: ${transactionId}`);

    // Marcar transação como processada
    await markTransactionAsProcessed(transactionId);
    console.log(`[Transaction Control] Transação marcada como processada: ${transactionId}`);
  } catch (error) {
    console.error(`[Transaction Control] Erro ao finalizar transação ${transactionId}:`, error);
    throw error;
  }
}

/**
 * Verifica se o email já foi enviado para esta transação
 */
export async function hasEmailBeenSent(transactionId: string): Promise<boolean> {
  try {
    const transaction = await getTransactionControl(transactionId);
    if (!transaction) {
      return false;
    }
    return transaction.emailSent === 1;
  } catch (error) {
    console.error(`[Transaction Control] Erro ao verificar email da transação ${transactionId}:`, error);
    return false;
  }
}
