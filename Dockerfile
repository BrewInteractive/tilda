FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY apps/api ./apps/api

RUN npm run build api

RUN addgroup --system nonroot \
    && adduser --system nonroot --ingroup nonroot

USER nonroot

EXPOSE 3000

CMD ["npm", "run", "start", "api"]