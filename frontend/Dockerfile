FROM node:20

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Clean and install (standard install is safer here than 'ci' when changing versions)
RUN npm cache clean --force && npm install

# Copy the rest of your app code
COPY . .

# EXPLICITLY set the path so the container can find the 'next' command
ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_ENV=production

# Run build using the absolute path to be 100% sure
RUN ./node_modules/.bin/next build

EXPOSE 3000
CMD ["npm", "start"]