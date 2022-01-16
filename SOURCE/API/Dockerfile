FROM node:12.20.0

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install

COPY . .

CMD ["yarn", "start"]