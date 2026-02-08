# Dugtong (Expo + Turso)

This app is an Expo (React Native + TypeScript) project that connects directly to Turso (LibSQL) without a separate backend service.

## Requirements

- Node.js + npm
- A Turso database URL and auth token

## Environment

Set the following environment variables (Expo public envs are recommended for React Native):

- `EXPO_PUBLIC_TURSO_DATABASE_URL`
- `EXPO_PUBLIC_TURSO_AUTH_TOKEN`

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Apply schema

   ```bash
   npm run turso:migrate
   ```

3. (Optional) Seed sample data

   ```bash
   npm run turso:seed
   ```

4. Start the app

   ```bash
   npx expo start
   ```

## Schema

The LibSQL schema lives in `turso/schema.sql`.
