import { parseEnv, z } from 'znv';

const envSchema = {
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  SECRET_ID: z.string(),
  SECRET_KEY: z.string(),
};

const ENV = parseEnv(process.env, envSchema);

export default ENV;
