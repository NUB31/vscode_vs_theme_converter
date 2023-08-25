FROM node:18 as build
WORKDIR /app

COPY ./package.json ./
RUN npm install

COPY ./src ./src
COPY ./static ./static
COPY ./svelte.config.js ./
COPY ./tsconfig.json ./
COPY ./vite.config.ts ./

RUN npm run build
RUN mkdir ./build/input
RUN mkdir ./build/output

FROM node:18 as deploy
WORKDIR /app

COPY --from=build ./app/build ./
COPY --from=build ./app/package.json ./
COPY ./binaries ./binaries

CMD [ "node", "index.js" ]