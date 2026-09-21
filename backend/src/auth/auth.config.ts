export type AuthEnv = {
  jwtSecret: string;
  jwtExpiresIn: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Loads JWT auth config. Never log returned values. */
export function loadAuthEnv(): AuthEnv {
  return {
    jwtSecret: requireEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '7d',
  };
}
