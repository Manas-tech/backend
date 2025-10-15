// Substep definitions matching frontend progressService
export const PHASE_SUBSTEPS = {
  discovery: [
    'First Call',
    'Requirements Gathering Session PRD',
    'Project Kickoff Session'
  ],
  design: [
    'Wireframes & User Flow',
    'UI Design & Prototypes',
    'Design Review & Approval'
  ],
  development: [
    'Environment Setup',
    'Database Design',
    'Backend Development',
    'Frontend Development',
    'API Integration',
    'Third-party Integrations'
  ],
  testing: [
    'Unit Testing',
    'Integration Testing',
    'User Acceptance Testing',
    'Bug Fixes & Optimization'
  ],
  launch: [
    'Production Deployment',
    'Monitoring Setup',
    'Go Live',
    'Launch Support'
  ],
  support: [
    'Documentation & Handover',
    'User Training',
    'Ongoing Maintenance',
    'Performance Optimization'
  ]
};

// Initialize substeps for a project
export const initializeSubsteps = () => {
  const substeps = {};
  Object.keys(PHASE_SUBSTEPS).forEach(phase => {
    substeps[phase] = PHASE_SUBSTEPS[phase].map(name => ({
      name,
      completed: false,
      completedDate: null,
      notes: ''
    }));
  });
  return substeps;
};

// Calculate phase progress based on completed substeps
export const calculatePhaseProgressFromSubsteps = (substeps) => {
  if (!substeps || substeps.length === 0) return 0;
  const completed = substeps.filter(s => s.completed).length;
  return Math.round((completed / substeps.length) * 100);
};

// Calculate overall progress from all phases
export const calculateOverallProgressFromPhases = (substepsData) => {
  if (!substepsData) return 0;

  const phases = Object.keys(PHASE_SUBSTEPS);
  let totalSubsteps = 0;
  let completedSubsteps = 0;

  phases.forEach(phase => {
    const phaseSubsteps = substepsData[phase] || [];
    totalSubsteps += phaseSubsteps.length;
    completedSubsteps += phaseSubsteps.filter(s => s.completed).length;
  });

  return totalSubsteps > 0 ? Math.round((completedSubsteps / totalSubsteps) * 100) : 0;
};

// Toggle substep completion
export const toggleSubstep = (substepsData, phase, substepName) => {
  if (!substepsData || !substepsData[phase]) return substepsData;

  const updatedPhaseSubsteps = substepsData[phase].map(substep => {
    if (substep.name === substepName) {
      return {
        ...substep,
        completed: !substep.completed,
        completedDate: !substep.completed ? new Date() : null
      };
    }
    return substep;
  });

  return {
    ...substepsData,
    [phase]: updatedPhaseSubsteps
  };
};

// Get substep by name
export const getSubstep = (substepsData, phase, substepName) => {
  if (!substepsData || !substepsData[phase]) return null;
  return substepsData[phase].find(s => s.name === substepName) || null;
};

// Get completion stats
export const getCompletionStats = (substepsData) => {
  if (!substepsData) return { total: 0, completed: 0, percentage: 0 };

  let total = 0;
  let completed = 0;

  Object.keys(PHASE_SUBSTEPS).forEach(phase => {
    const phaseSubsteps = substepsData[phase] || [];
    total += phaseSubsteps.length;
    completed += phaseSubsteps.filter(s => s.completed).length;
  });

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};
