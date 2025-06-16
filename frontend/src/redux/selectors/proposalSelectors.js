// src/redux/selectors/proposalSelectors.js
import { createSelector } from "@reduxjs/toolkit";

export const makeSelectProposalsByProjectId = (projectId) =>
  createSelector(
    (state) => state.proposal.proposalsByProjectId,
    (proposalsByProjectId) => proposalsByProjectId[projectId] || []
  );
