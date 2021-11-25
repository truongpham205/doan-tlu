FROM node:10-alpine

WORKDIR /app
COPY package*.json .
COPY yarn.lock .
RUN yarn 
COPY . . 
RUN yarn build


FROM nginx:1.15.2-alpine
COPY --from=builder /app/build /var/www
COPY --from=builder /app/nginx/default.conf /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]