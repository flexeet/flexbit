export enum UserTier {
  FREE = 'free',
  PIONEER = 'pioneer',
  EARLY_ADOPTER = 'early_adopter',
  GROWTH = 'growth',
  PRO = 'pro',
}

export enum Feature {
  CORE_ANALYSIS = 'core_analysis', // Narrative, VQSG, Screener
  COMMUNITY_ACCESS = 'community_access',
  WATCHLIST_ALERTS = 'watchlist_alerts',
  EXPORT_DATA = 'export_data',
  PRIORITY_SUPPORT = 'priority_support',
  TIMING_LABELS = 'timing_labels',
}

type PermissionMap = {
  [key in UserTier]: Feature[];
};

const PERMISSIONS: PermissionMap = {
  [UserTier.FREE]: [],
  [UserTier.PIONEER]: [
    Feature.CORE_ANALYSIS,
    Feature.COMMUNITY_ACCESS,
    Feature.TIMING_LABELS,
  ],
  [UserTier.EARLY_ADOPTER]: [
    Feature.CORE_ANALYSIS,
    Feature.COMMUNITY_ACCESS,
    Feature.TIMING_LABELS,
    Feature.PRIORITY_SUPPORT, // 6 months, handled by expiry logic elsewhere
  ],
  [UserTier.GROWTH]: [
    Feature.CORE_ANALYSIS,
    Feature.COMMUNITY_ACCESS,
    Feature.TIMING_LABELS,
    Feature.WATCHLIST_ALERTS,
    Feature.EXPORT_DATA,
    Feature.PRIORITY_SUPPORT,
  ],
  [UserTier.PRO]: [
    Feature.CORE_ANALYSIS,
    Feature.COMMUNITY_ACCESS,
    Feature.TIMING_LABELS,
    Feature.WATCHLIST_ALERTS,
    Feature.EXPORT_DATA,
    Feature.PRIORITY_SUPPORT,
  ],
};

export const hasPermission = (tier: UserTier, feature: Feature): boolean => {
  const features = PERMISSIONS[tier] || [];
  return features.includes(feature);
};

export const getTierConfig = (tier: UserTier) => {
  switch (tier) {
    case UserTier.PIONEER:
    case UserTier.EARLY_ADOPTER:
      return {
        maxWatchlistSize: 20,
        canExport: false,
        supportLevel: 'community',
      };
    case UserTier.GROWTH:
      return {
        maxWatchlistSize: 50,
        canExport: true,
        supportLevel: 'priority',
      };
    case UserTier.PRO:
      return {
        maxWatchlistSize: 9999, // Unlimited
        canExport: true,
        supportLevel: 'priority_vip',
      };
    default:
      return {
        maxWatchlistSize: 5,
        canExport: false,
        supportLevel: 'none',
      };
  }
};

// Middleware Mock for Express
export const checkPermission = (feature: Feature) => {
  return (req: any, res: any, next: any) => {
    const userTier = req.user?.subscription.tier || UserTier.FREE;

    if (hasPermission(userTier, feature)) {
      next();
    } else {
      res.status(403).json({
        error: 'Forbidden',
        message: `Upgrade to Growth or Pro to access ${feature}`,
        upgradeLink: '/pricing'
      });
    }
  };
};
