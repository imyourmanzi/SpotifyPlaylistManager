# syntax=docker/dockerfile:1
# ===== build stage =====
FROM node:18-bullseye as build

# set up environment
WORKDIR /usr/src/build_app

# install dependencies
COPY --chown=node:node package*.json /usr/src/build_app
RUN npm ci

# build/compile the whole application
COPY --chown=node:node . /usr/src/build_app
RUN npx nx run server:build:production

# prune node_modules
RUN npm prune --omit=dev

# ====== run stage ======
FROM node:18-bullseye-slim

# set up environment
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app

# copy in source code
COPY --chown=node:node --from=build /usr/src/build_app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/build_app/dist/packages/server /usr/src/app

# start-up
CMD [ "node", "./main.js" ]
