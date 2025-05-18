FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY .env .env

EXPOSE 3213

CMD [ "node", "dist/main.js" ]