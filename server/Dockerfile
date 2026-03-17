# Use a specific Node version for consistency
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source code and build
COPY . .
RUN pnpm build

# Expose the port your Express app uses
EXPOSE 5000

CMD ["pnpm", "start"]