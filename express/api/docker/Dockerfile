FROM node:16-buster

WORKDIR /app

COPY ../package*.json ./

RUN npm install

COPY ../ ./

RUN npx tsc 

RUN apt install wget
RUN wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb
RUN apt-get update
RUN apt-get install -y dotnet-sdk-6.0


EXPOSE 3002
ENV PORT=3002

# Remember, this will be your production values, not dev values. 
# That is why i am using port 3001 (which is my frontend host server, and not 3000 (React development port))
ENV API_PUBLIC_URL=http://localhost:3002
ENV CLIENT_PUBLIC_URL=http://localhost:3001
ENV ENABLE_SUDO=0

CMD [ "node", "src/server.js" ]