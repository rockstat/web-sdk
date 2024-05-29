FROM node:18-alpine as builder

WORKDIR /build

COPY package.json .
COPY package-lock.json .
# COPY yarn.lock .

# RUN yarn install && yarn cache clean
RUN npm ci && npm cache clean --force

COPY . .
ENV NODE_ENV production

# RUN yarn build && rm -rf node_modules
RUN npm run build  && rm -rf node_modules

# Working image
FROM alpine:3.18

VOLUME  /usr/share/web-sdk
WORKDIR /usr/share/web-sdk

COPY --from=builder /build /usr/share/web-sdk

CMD ["/bin/ls", "/usr/share/web-sdk/"]
