FROM node:12.19.0-alpine

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install

COPY . .
VOLUME [ "/app/public/upload" ]

EXPOSE 3000
EXPOSE ${PORT}

CMD ["yarn", "dockerstart"]