FROM node:18

WORKDIR /usr/src/app

EXPOSE 3001

ENTRYPOINT ["/bin/sh", "-c", "npm install && npm run build && npm run start:prod"]
