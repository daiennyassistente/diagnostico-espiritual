import { describe, expect, it } from 'vitest';
import { getAdminUserStatusMeta } from './AdminDashboardContent';

describe('getAdminUserStatusMeta', () => {
  it('retorna status de início de quiz por padrão', () => {
    expect(getAdminUserStatusMeta({ status: 'quiz', quizStatus: '' })).toEqual({
      key: 'quiz_started',
      label: 'Início Quiz',
      badgeClass: 'bg-blue-100 text-blue-800',
    });
  });

  it('retorna status de quiz abandonado', () => {
    expect(getAdminUserStatusMeta({ status: 'quiz', quizStatus: 'Quiz Abandonado' })).toEqual({
      key: 'quiz_abandoned',
      label: 'Quiz Abandonado',
      badgeClass: 'bg-rose-100 text-rose-800',
    });
  });

  it('retorna status de quiz completo', () => {
    expect(getAdminUserStatusMeta({ status: 'quiz', quizStatus: 'Quiz Concluído' })).toEqual({
      key: 'quiz_completed',
      label: 'Quiz Completo',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    });
  });

  it('retorna status pendente', () => {
    expect(getAdminUserStatusMeta({ status: 'pendente', quizStatus: 'Quiz Concluído' })).toEqual({
      key: 'pending',
      label: '⏳ Pendente',
      badgeClass: 'bg-amber-100 text-amber-800',
    });
  });

  it('retorna status comprou', () => {
    expect(getAdminUserStatusMeta({ status: 'comprou', quizStatus: 'Quiz Concluído' })).toEqual({
      key: 'bought',
      label: '✓ Comprou',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    });
  });
});
