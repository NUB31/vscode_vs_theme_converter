FROM node:16-slim

WORKDIR /app

COPY ../package*.json .

RUN npm install

COPY ../src ./src

EXPOSE 3000
ENV PORT=3000

ENV EMAIL_PASSWORD="NoDaddyNotInThere-UwU"

CMD [ "node", "index.js" ]