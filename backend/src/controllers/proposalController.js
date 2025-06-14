import Proposal from '../models/proposal.js';
import Project from '../models/project.js';

export const createProposal = async (req, res) => {
  try {
    const { projectId, coverLetter, price } = req.body;
    const freelancer = req.user._id;

    const proposal = new Proposal({ project: projectId, freelancer, coverLetter, price });
    await proposal.save();

    await Project.findByIdAndUpdate(projectId, { $push: { proposals: proposal._id } });

    res.status(201).json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProposalStatus = async (req, res) => {
  try {
    const { proposalId, status } = req.body;

    const proposal = await Proposal.findById(proposalId).populate('project');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    if (proposal.project.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    proposal.status = status;
    await proposal.save();

    res.json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
