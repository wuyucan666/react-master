FROM node:8-alpine as builder
WORKDIR /app
ADD package.json  ./
RUN yarn
ADD . .

RUN yarn build

FROM nginx
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .
