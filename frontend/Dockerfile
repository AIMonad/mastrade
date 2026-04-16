FROM node:20

WORKDIR /app

RUN npm config set strict-ssl false && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 120000

COPY package.json package-lock.json* ./

RUN npm install --loglevel verbose

COPY . .

RUN npx next build

EXPOSE 3000
CMD ["npm", "start"]