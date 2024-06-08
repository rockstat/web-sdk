FROM node:20.14-alpine as builder

WORKDIR /build

ARG NPM_CONFIG_REGISTRY_ARG=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY_ARG   

COPY package.json .
RUN npm i --loglevel http --platform=linux && npm cache clean --force

COPY . .
ENV NODE_ENV production

RUN npm run build  && rm -rf node_modules

FROM alpine:3.18

ARG NPM_CONFIG_REGISTRY_ARG=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY_ARG   

VOLUME  /usr/share/web-sdk
WORKDIR /usr/share/web-sdk

COPY --from=builder /build /usr/share/web-sdk

CMD ["/bin/ls", "/usr/share/web-sdk/"]
