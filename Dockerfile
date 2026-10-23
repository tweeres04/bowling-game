FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# `output: 'standalone'` bundles only what the server needs; static assets
# are copied alongside it
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# Docker sets HOSTNAME to the container ID; bind to all interfaces instead
ENV HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
