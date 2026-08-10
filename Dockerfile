FROM node:20.14-alpine AS builder

WORKDIR /build

ARG NPM_CONFIG_REGISTRY_ARG=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY_ARG   

COPY package.json package-lock.json ./
RUN npm ci --loglevel http && npm cache clean --force

COPY . .
ENV NODE_ENV=production

RUN npm run build  && rm -rf node_modules

FROM alpine:3.18

ARG NPM_CONFIG_REGISTRY_ARG=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY_ARG   

VOLUME  /usr/share/web-sdk
WORKDIR /usr/share/web-sdk

COPY --from=builder /build /usr/share/web-sdk

CMD ["/bin/ls", "/usr/share/web-sdk/"]
