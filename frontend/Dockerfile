FROM node:20

# 1. Set working directory
WORKDIR /app

# 2. Copy dependency files first
COPY package.json package-lock.json* ./

# 3. Use 'install' instead of 'ci' temporarily to force-sync the new packages
# and clear any local npm cache issues
RUN npm cache clean --force && npm install

# 4. Copy the rest of your app
COPY . .

# 5. Explicitly set environment to production for the build
ENV NODE_ENV=production

# 6. Run the build
RUN npm run build

# 7. Standard ports and start command
EXPOSE 3000
CMD ["npm", "start"]