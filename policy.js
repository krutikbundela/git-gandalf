// valid inputs this module accepts
const RISK_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};

// valid outputs this module produces
export const DECISIONS = {
  ALLOW: "ALLOW",
  WARN: "WARN",
  BLOCK: "BLOCK",
};

const POLICY = {
  [RISK_LEVELS.LOW]: DECISIONS.ALLOW,
  [RISK_LEVELS.MEDIUM]: DECISIONS.WARN,
  [RISK_LEVELS.HIGH]: DECISIONS.BLOCK,
};

export default function decide(risk) {
  const decision = POLICY[risk];

  if (!decision) {
    throw new Error(`policy.decide() received unknown risk level: "${risk}"`);
  }

  return decision;
}
