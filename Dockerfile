FROM node:lts-alpine

EXPOSE 3000
WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Applies schema changes to the mounted database before starting
CMD ["npm", "run", "start:docker"]
