# syntax=docker/dockerfile:1

# ---- Dependencies ----
FROM node:26.13.1-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# ---- Build ----
FROM node:26.13.1-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- Runtime ----
FROM node:26.13.1-alpine AS runner
ENV NODE_ENV=production \
    PORT=8000 \
    PRISMA_HIDE_UPDATE_MESSAGE=1

WORKDIR /app

RUN addgroup -S nodejs -g 1001 && adduser -S nestjs -u 1001 -G nodejs

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev --no-audit --no-fund

COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
