FROM node:16-alpine
WORKDIR /usr/src/app
COPY . .
# COPY package*.json ./
RUN npm i -g nodemon
RUN npm i
EXPOSE 3000
ENTRYPOINT [ "npm","run", "start" ]