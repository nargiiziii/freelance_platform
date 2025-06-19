
// Импорт функции createSelector из Redux Toolkit для создания мемоизированного селектора
import { createSelector } from "@reduxjs/toolkit";

// Функция-селектор, которая возвращает другой селектор для получения откликов по конкретному projectId
export const makeSelectProposalsByProjectId = (projectId) =>
  createSelector(
    // Входной селектор: извлекает объект proposalsByProjectId из состояния proposal
    (state) => state.proposal.proposalsByProjectId,
    // Выходная функция: возвращает массив откликов для данного projectId, либо пустой массив, если ничего нет
    (proposalsByProjectId) => proposalsByProjectId[projectId] || []
  );
