FROM node:16-alpine as build

WORKDIR /app

COPY ./react/package*.json ./

RUN npm install

COPY ./react/ ./

RUN npm run build

FROM node:16-bullseye-slim

WORKDIR /app

COPY ./api/package*.json ./

RUN npm install

COPY  ./api/ ./

RUN npx tsc 

RUN mkdir src/static

COPY --from=build /app/dist/ ./src/static/

RUN apt-get update
RUN apt-get install wget -y
RUN wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb
RUN apt-get update
RUN apt-get install -y dotnet-sdk-6.0

EXPOSE 80
ENV PORT=80

CMD [ "node", "src/server.js" ]
