import { config } from "dotenv";
import { z } from "zod";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

let envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.string().default("5000"),
  LOG_FORMAT: z.string().nullish().default("dev"),
  SECRET_KEY: z.string(),
  ORIGIN: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string(),
  POSTGRES_USERNAME: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
});

let _serverEnv = envSchema.safeParse(process.env);

if (!_serverEnv.success) {
  const errors = _serverEnv.error.format();

  const formatedError = Object.entries(errors)
    .map(([name, value]) => {
      console.log({ name, value });
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;
    })
    .filter(Boolean);
  console.error("❌ Invalid environment variables:\n", ...formatedError);
  throw new Error("Invalid environment variables");
}

export const env = { ..._serverEnv.data };
