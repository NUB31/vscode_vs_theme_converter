FROM node:16-bullseye-slim

WORKDIR /app

COPY ../package*.json ./

RUN npm install

COPY ../ ./

RUN npx tsc 

RUN apt-get update
RUN apt-get install wget -y
RUN wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb
RUN apt-get update
RUN apt-get install -y dotnet-sdk-6.0


EXPOSE 3003
ENV BACKEND_PORT=3003

# Remember, this will be your production values, not dev values. 
# That is why i am using port 3001 (which is my frontend host server, and not 3000 (React development port))
ENV API_PUBLIC_URL=
ENV CLIENT_PUBLIC_URL=

CMD [ "node", "src/server.js" ]
