# Use the Node version matching your dev environment
FROM node:22-slim

# Install pnpm as specified in package.json
RUN npm install -g pnpm@10.32.1

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose the port from server file
EXPOSE 5000

# Start development mode as defined in your scripts
CMD [ "pnpm", "run", "dev" ]