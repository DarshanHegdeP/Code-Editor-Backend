FROM node:18-alpine

# Install Docker CLI so the app can spawn sibling containers
RUN apk add --no-cache docker-cli

WORKDIR /app
COPY package.json .
# Create a dummy package.json if you haven't run npm init
RUN npm install
COPY server.js .

CMD ["node", "server.js"]
