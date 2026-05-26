export interface AnalyticsData {
  weekly_trends: Array<{ name: string; score: number; avg: number }>;
  time_distribution: Record<string, number>;
  top_apps: Array<{ name: string; hours: number }>;
}

export interface DistractionPattern {
  topDistractionApps: Array<{ name: string; score: number }>;
  peakDistractionHour: { hour: string; riskLevel: "high" | "medium" | "low" };
  weeklyTrendDirection: "improving" | "declining" | "stable";
  distractionPercentage: number;
  estimatedDistractionHours: number;
}

export interface DistractionAction {
  id: string;
  title: string;
  description: string;
  category: "block" | "schedule" | "break" | "focus";
  priority: "high" | "medium" | "low";
  actionLabel: string;
  metric?: string;
}

export function analyzeDistractionPatterns(
  analyticsData: AnalyticsData | null,
  allowedApps: string[] = [] 
): DistractionPattern {
  if (!analyticsData) {
    return getDefaultPattern();
  }

  const {
    weekly_trends = [],
    time_distribution = {},
    top_apps = [],
  } = analyticsData;

  const PRODUCTIVE_APPS = allowedApps.length > 0 
    ? allowedApps.map(app => app.toLowerCase())
    : ["vs code", "figma", "notion"]; 

  const distractionApps = top_apps
    .filter(
      (app) =>
        !PRODUCTIVE_APPS.some((prod) => app.name.toLowerCase().includes(prod))
    )
    .slice(0, 3)
    .map((app, idx) => ({
      name: app.name,
      score: 100 - idx * 20,
    }))
    .filter((app) => app.score > 40);

  const peakHour = detectPeakDistractionTime(weekly_trends, time_distribution);
  const trendDirection = analyzeTrendDirection(weekly_trends);

  const totalHours = Object.values(time_distribution).reduce((a, b) => a + b, 0);
  const deepWorkHours = time_distribution["Deep Work"] || 0;
  const distractionPercentage =
    totalHours > 0
      ? Math.round(((totalHours - deepWorkHours) / totalHours) * 100)
      : 0;

  const estimatedDistractionHours = totalHours - deepWorkHours;

  return {
    topDistractionApps: distractionApps,
    peakDistractionHour: peakHour,
    weeklyTrendDirection: trendDirection,
    distractionPercentage,
    estimatedDistractionHours,
  };
}

function detectPeakDistractionTime(
  trends: Array<{ name: string; score: number; avg: number }>,
  timeDistribution: Record<string, number>
): { hour: string; riskLevel: "high" | "medium" | "low" } {
  if (trends.length === 0) {
    return { hour: "Insufficient Data", riskLevel: "low" };
  }

  const avgScore =
    trends.reduce((sum, t) => sum + (t.score || 0), 0) / trends.length;
  const lowestScore = Math.min(...trends.map((t) => t.score || 0));

  if (lowestScore < avgScore * 0.7) {
    return { hour: "2 PM - 4 PM", riskLevel: "high" };
  } else if (lowestScore < avgScore * 0.85) {
    return { hour: "3 PM - 5 PM", riskLevel: "medium" };
  }

  return { hour: "After lunch", riskLevel: "low" };
}

function analyzeTrendDirection(
  trends: Array<{ name: string; score: number; avg: number }>
): "improving" | "declining" | "stable" {
  if (trends.length < 2) return "stable";

  const firstHalf = trends.slice(0, Math.ceil(trends.length / 2));
  const secondHalf = trends.slice(Math.ceil(trends.length / 2));

  const avgFirst =
    firstHalf.reduce((sum, t) => sum + (t.score || 0), 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((sum, t) => sum + (t.score || 0), 0) / secondHalf.length;

  const difference = avgSecond - avgFirst;

  if (difference > 5) return "improving";
  if (difference < -5) return "declining";
  return "stable";
}

export function generateDistractionActions(
  pattern: DistractionPattern
): DistractionAction[] {
  const actions: DistractionAction[] = [];

  if (pattern.topDistractionApps.length > 0) {
    const topApp = pattern.topDistractionApps[0];
    actions.push({
      id: "block-app",
      title: `Block ${topApp.name}`,
      description: `${topApp.name} is your biggest distraction. Block it during focus sessions.`,
      category: "block",
      priority: "high",
      actionLabel: "Enable Blocker",
      metric: `${topApp.score}% distraction`,
    });
  }

  if (pattern.peakDistractionHour.riskLevel === "high") {
    actions.push({
      id: "strict-focus",
      title: `Protect ${pattern.peakDistractionHour.hour}`,
      description: `You're most distracted during this time. Enable strict focus mode to stay on task.`,
      category: "focus",
      priority: "high",
      actionLabel: "Start Strict Focus",
      metric: `${pattern.distractionPercentage}% distraction`,
    });
  }

  if (pattern.estimatedDistractionHours > 2) {
    actions.push({
      id: "structured-breaks",
      title: "Implement Pomodoro",
      description: `You spend ${Math.round(pattern.estimatedDistractionHours)}h unfocused. Try 50min focus + 10min breaks.`,
      category: "break",
      priority: "medium",
      actionLabel: "Apply Pomodoro",
      metric: `Reduce ${pattern.distractionPercentage}% distraction`,
    });
  }

  if (
    pattern.weeklyTrendDirection === "declining" &&
    pattern.topDistractionApps.length > 1
  ) {
    const secondApp = pattern.topDistractionApps[1];
    actions.push({
      id: "block-secondary",
      title: `Also block ${secondApp.name}`,
      description: `Your productivity is declining. Block ${secondApp.name} to regain focus.`,
      category: "block",
      priority: "medium",
      actionLabel: "Add to Blocklist",
      metric: "Productivity declining",
    });
  }

  if (pattern.weeklyTrendDirection === "improving") {
    actions.push({
      id: "deep-work",
      title: "Schedule Deep Work Sessions",
      description: "Your productivity is improving! Capitalize on this momentum with scheduled deep work blocks.",
      category: "schedule",
      priority: "medium",
      actionLabel: "Schedule Sessions",
      metric: "Momentum detected",
    });
  }

  if (pattern.distractionPercentage > 30) {
    actions.push({
      id: "awareness",
      title: "Reduce Context Switching",
      description: `${pattern.distractionPercentage}% of your time is distracted. Use notifications blocker during focus.`,
      category: "focus",
      priority: "high",
      actionLabel: "Enable Blocker",
    });
  }

  return actions;
}

function getDefaultPattern(): DistractionPattern {
  return {
    topDistractionApps: [],
    peakDistractionHour: { hour: "Insufficient Data", riskLevel: "low" },
    weeklyTrendDirection: "stable",
    distractionPercentage: 0,
    estimatedDistractionHours: 0,
  };
}

export function calculateDistractionScoreImpact(
  distractionPercentage: number,
  previousScore: number
): { impactScore: number; message: string; improvement: boolean } {
  const scoreReduction = (distractionPercentage / 10) * 5;
  const impactScore = Math.max(0, previousScore - scoreReduction);

  let message = "";
  let improvement = false;

  if (scoreReduction > 10) {
    message = `Your score dropped by ${Math.round(scoreReduction)} points due to ${distractionPercentage}% distraction today.`;
    improvement = false;
  } else if (scoreReduction > 5) {
    message = `Minor impact: ${Math.round(scoreReduction)} points lost due to distractions.`;
    improvement = false;
  } else if (distractionPercentage < 20) {
    message = `Great focus! You maintained low distraction levels (${distractionPercentage}%).`;
    improvement = true;
  } else {
    message = `You're doing okay. Keep working on reducing distractions.`;
    improvement = true;
  }

  return { impactScore, message, improvement };
}

export function formatDistractionTime(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}
