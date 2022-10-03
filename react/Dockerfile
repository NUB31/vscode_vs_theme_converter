FROM node:16-alpine as build

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY ./ ./

ENV VITE_API_URL="http://localhost:3000"

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]