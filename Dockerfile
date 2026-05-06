FROM node:20
WORKDIR /app
COPY package.json .
RUN npm install --force
COPY . .
RUN mkdir -p auth
CMD ["node", "index.js"]
