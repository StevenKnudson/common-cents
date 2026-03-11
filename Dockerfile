# ── Stage 1: Build shared package ──────────────────────────────
FROM node:20-alpine AS shared-build
WORKDIR /app
COPY packages/shared/package.json packages/shared/
COPY packages/shared/ packages/shared/
WORKDIR /app/packages/shared
RUN npm install && npm run build

# ── Stage 2: Build API ────────────────────────────────────────
FROM node:20-alpine AS api-build
WORKDIR /app
COPY apps/api/package.json apps/api/
COPY apps/api/ apps/api/
COPY --from=shared-build /app/packages/shared packages/shared/
WORKDIR /app/apps/api
RUN npm install && npx prisma generate && npm run build

# ── Stage 3: Build Web ────────────────────────────────────────
FROM node:20-alpine AS web-build
WORKDIR /app
COPY apps/web/package.json apps/web/
COPY apps/web/ apps/web/
COPY --from=shared-build /app/packages/shared packages/shared/
WORKDIR /app/apps/web
RUN npm install && npm run build

# ── Stage 4: Production API image ─────────────────────────────
FROM node:20-alpine AS api
WORKDIR /app
COPY --from=api-build /app/apps/api/dist ./dist
COPY --from=api-build /app/apps/api/node_modules ./node_modules
COPY --from=api-build /app/apps/api/prisma ./prisma
COPY --from=api-build /app/apps/api/package.json .
ENV API_PORT=4000
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

# ── Stage 5: Production Web image (nginx) ─────────────────────
FROM nginx:alpine AS web
COPY --from=web-build /app/apps/web/dist /usr/share/nginx/html
COPY nginx/web.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
