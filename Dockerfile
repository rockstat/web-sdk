FROM node:18-alpine as builder

WORKDIR /build

COPY package.json .
COPY package-lock.json .
# COPY yarn.lock .

COPY .npmrc .

# RUN yarn install && yarn cache clean
RUN npm ci   --loglevel http --platform=linux && npm cache clean --force

COPY . .
RUN rm -f .npmrc
ENV NODE_ENV production

# RUN yarn build && rm -rf node_modules
RUN npm run build  && rm -rf node_modules

# Working image
FROM alpine:3.18

VOLUME  /usr/share/web-sdk
WORKDIR /usr/share/web-sdk

COPY --from=builder /build /usr/share/web-sdk

CMD ["/bin/ls", "/usr/share/web-sdk/"]
