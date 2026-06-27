FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn prisma:generate
CMD ["sh", "-c", "yarn prisma:migrate && yarn prisma:seed && yarn dev"]
