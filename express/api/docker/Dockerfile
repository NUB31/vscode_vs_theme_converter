FROM node:16-alpine

WORKDIR /app

COPY ../package*.json .

RUN npm install

COPY ../src ./src

EXPOSE 3002
ENV PORT=3002

ENV MYSQL_HOST=localhost
ENV MYSQL_PORT=3306
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=
ENV MYSQL_DATABASE=prodDatabase
ENV JWT_TOKEN=randomString

# Remember, this will be your production values, not dev values. 
# That is why i am using port 3001 (which is my frontend host server, and not 3000 (React development port))
ENV API_PUBLIC_URL=http://localhost:3002
ENV CLIENT_PUBLIC_URL=http://localhost:3001

CMD [ "node", "index.js" ]