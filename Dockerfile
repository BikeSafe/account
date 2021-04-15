FROM node:carbon-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# RUN npm run build

COPY . .

RUN npm run build
COPY ormconfig.docker.json ./ormconfig.json
# COPY .env ./dist/
WORKDIR ./dist

EXPOSE 4000
CMD node src/index.js
# #
# # stage 1 building the code
# FROM node:14 as builder
# WORKDIR /usr/app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
#
# # stage 2
# FROM node:14
# WORKDIR /usr/app
# COPY package*.json ./
# RUN npm install --production
#
# COPY --from=builder /usr/app/dist ./dist
#
# COPY ormconfig.docker.json ./ormconfig.json
# COPY .env .
#
# EXPOSE 4000
# CMD node dist/src/index.js
