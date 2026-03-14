const sampleStartups = [
  {
    id: 'matchmint',
    title: 'MatchMint',
    tagline: 'Skill-based founder matching for first-time startup teams.',
    description:
      'A guided collaboration space where founders can discover vetted developers, designers, and marketers before committing to a build sprint.',
    stage: 'idea',
    category: 'Collaboration',
    location: 'Remote',
    neededRoles: ['Full-Stack Developer', 'Product Designer', 'Growth Marketer'],
  },
  {
    id: 'ledgerlane',
    title: 'LedgerLane',
    tagline: 'Finance ops tooling for indie SaaS founders.',
    description:
      'An operations dashboard that helps bootstrapped startups track burn, reconcile subscriptions, and forecast runway in one place.',
    stage: 'mvp',
    category: 'FinTech',
    location: 'Hybrid',
    neededRoles: ['Backend Engineer', 'UI Engineer'],
  },
  {
    id: 'greencrate',
    title: 'GreenCrate',
    tagline: 'Sustainable packaging marketplace for modern brands.',
    description:
      'A sourcing platform that connects e-commerce brands with eco-friendly packaging suppliers and logistics partners.',
    stage: 'growth',
    category: 'Climate',
    location: 'Global',
    neededRoles: ['Supply Chain Analyst', 'Brand Designer'],
  },
];

export const getStartups = (_req, res) => {
  res.status(200).json({
    success: true,
    count: sampleStartups.length,
    data: sampleStartups,
  });
};

export const getStartupById = (req, res) => {
  const startup = sampleStartups.find((item) => item.id === req.params.startupId);

  if (!startup) {
    return res.status(404).json({
      success: false,
      message: 'Startup not found.',
    });
  }

  return res.status(200).json({
    success: true,
    data: startup,
  });
};

