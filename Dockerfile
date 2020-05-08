ARG VERSION="current"
FROM node:$VERSION-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

COPY data_sources /data_sources/

RUN npm install --production

COPY . .

ENV PORT=8080

CMD npm start

