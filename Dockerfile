# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 g++ make

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Increase the Node.js memory limit and build the application
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# Stage 2: Serve the application with Bun
FROM oven/bun:alpine

# Set working directory
WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app ./

# Install production dependencies with Bun
RUN bun install --production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
