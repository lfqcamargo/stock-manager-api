FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install

COPY . .

ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

RUN npm run build

RUN npm ci --omit=dev && npm cache clean --force


FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/generated ./generated

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/infra/main.js"]