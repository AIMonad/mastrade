FROM node:20-slim 
# Slim is better for low-memory VPS

WORKDIR /app

# Install essential build tools (sometimes needed for crypto libs)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

# Install with flags to save memory and ensure binaries are linked
RUN npm install --no-audit --no-fund --loglevel=error

COPY . .

# Set environment
ENV NODE_ENV=production

# Use 'npx' which is smarter at finding the local 'next' binary
RUN npx next build

EXPOSE 3000
CMD ["npm", "start"]