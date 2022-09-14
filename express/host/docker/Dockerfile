FROM node:16-slim

WORKDIR /app

COPY ../package*.json .

RUN npm install
RUN npm install typescript

COPY ../src ./src
COPY ../tsconfig.json ./tsconfig.json

RUN npx tsc

EXPOSE 3004
ENV PORT=3004

ENV EMAIL_PASSWORD=

CMD [ "node", "src/server.js" ]