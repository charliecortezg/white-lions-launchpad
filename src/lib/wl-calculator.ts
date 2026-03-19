export type Category = 'biberón' | 'escuelita' | 'estrellita' | 'infantil' | 'juvenil';
export type LeonTier = 'León Blanco' | 'León Azul' | 'León Dorado';
export type Location = 'mexicali' | 'otra_ciudad' | 'internacional';

export interface QuestionnaireAnswers {
  playerName: string;
  age: number;
  physicalActivityDays: 1 | 2 | 3 | 4;
  coordination: 1 | 2 | 3 | 4 | 5;
  balance: 1 | 2 | 3 | 4 | 5;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  footballLove: 1 | 2 | 3 | 4 | 5;
  priorExperience: 0 | 1 | 2 | 3;
  instructionFollowing: 1 | 2 | 3 | 4 | 5;
  teamwork: 1 | 2 | 3 | 4 | 5;
  persistence: 1 | 2 | 3 | 4 | 5;
  parentGoal: string;
  parentName: string;
  email: string;
  phone?: string;
  location: Location;
}

export interface DimensionScores {
  coord: number;
  energy: number;
  conexion: number;
  actitud: number;
}

export interface CalculatorResult {
  coeficiente: number;
  tier: LeonTier;
  category: Category;
  dimensions: DimensionScores;
  ventana: number;
  percentile: number | null;
  percentileText: string;
  tierDescription: string;
}

function getCategory(age: number): Category {
  if (age <= 5) return 'biberón';
  if (age <= 7) return 'escuelita';
  if (age <= 9) return 'estrellita';
  if (age <= 11) return 'infantil';
  return 'juvenil';
}

const WEIGHTS: Record<Category, DimensionScores> = {
  'biberón':    { coord: 0.35, energy: 0.30, conexion: 0.15, actitud: 0.20 },
  'escuelita':  { coord: 0.30, energy: 0.30, conexion: 0.20, actitud: 0.20 },
  'estrellita': { coord: 0.28, energy: 0.25, conexion: 0.25, actitud: 0.22 },
  'infantil':   { coord: 0.25, energy: 0.20, conexion: 0.28, actitud: 0.27 },
  'juvenil':    { coord: 0.22, energy: 0.18, conexion: 0.32, actitud: 0.28 },
};

const TIER_DESCRIPTIONS: Record<LeonTier, (n: string) => string> = {
  'León Blanco': (n) => `${n} está en el punto de partida ideal. En White Lions construimos la base desde cero con metodología formativa seria. Esta es la etapa más valiosa del proceso — todo está por escribirse.`,
  'León Azul':   (n) => `${n} tiene una base sólida que acelera su desarrollo. Su perfil indica que puede crecer significativamente dentro del sistema formativo. Ya tiene lo más importante: actitud y disposición.`,
  'León Dorado': (n) => `${n} tiene un perfil excepcional. La combinación de sus capacidades físicas, cognitivas y actitud es poco común para su edad. Con el sistema formativo correcto, su techo es muy alto.`,
};

function getPercentile(coef: number): number | null {
  if (coef >= 91) return 10;
  if (coef >= 81) return 15;
  if (coef >= 71) return 30;
  if (coef >= 63) return 45;
  if (coef >= 51) return 75;
  return null;
}

function getPercentileText(coef: number, name: string, age: number): string {
  const pct = getPercentile(coef);
  if (!pct) return `${name} está dando sus primeros pasos en el camino León de su edad.`;
  return `${name} está en el **top ${pct}%** de los jugadores de ${age} años evaluados.`;
}

export function calculateWLCoefficient(a: QuestionnaireAnswers): CalculatorResult {
  const category = getCategory(a.age);
  const w = WEIGHTS[category];

  const coord    = Math.min(100, Math.round(((a.coordination + a.balance) / 10) * 100));
  const physNorm = (a.physicalActivityDays / 4) * 5;
  const energy   = Math.min(100, Math.round(((a.energyLevel + physNorm) / 10) * 100));
  const conexion = Math.min(100, Math.round(((a.footballLove * 1.2 + a.instructionFollowing) / 11) * 100));
  const actitud  = Math.min(100, Math.round(((a.teamwork + a.persistence) / 10) * 100));

  const baseScore = (coord * w.coord) + (energy * w.energy) + (conexion * w.conexion) + (actitud * w.actitud);

  const expBonus  = ([10, 7, 4, 1] as const)[a.priorExperience];
  const ageBonus  = a.age <= 7 ? 8 : a.age <= 11 ? 5 : 3;
  const actBonus  = a.physicalActivityDays - 1;
  const ventana   = Math.min(20, expBonus + ageBonus + actBonus);

  const coeficiente = Math.min(100, Math.max(0, Math.round(baseScore * 0.80 + ventana)));

  const tier: LeonTier = coeficiente >= 81 ? 'León Dorado' : coeficiente >= 63 ? 'León Azul' : 'León Blanco';

  return {
    coeficiente,
    tier,
    category,
    dimensions: { coord, energy, conexion, actitud },
    ventana,
    percentile: getPercentile(coeficiente),
    percentileText: getPercentileText(coeficiente, a.playerName, a.age),
    tierDescription: TIER_DESCRIPTIONS[tier](a.playerName),
  };
}
