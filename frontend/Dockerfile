FROM node:20

WORKDIR /app

# 1. Disable SSL strictness temporarily if your VPS has clock/cert issues
# and set a massive timeout for slow networks
RUN npm config set strict-ssl false && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 120000

COPY package.json package-lock.json* ./

# 2. Install with 'verbose' so we can see EXACTLY where it hangs in the logs
RUN npm install --loglevel verbose

COPY . .

# 3. Use 'npx' to find the binary regardless of pathing
RUN npx next build

EXPOSE 3000
CMD ["npm", "start"]