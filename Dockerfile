# Stage 1: Build the application
FROM oven/bun:alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN bun install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the application
FROM oven/bun:alpine

# Set working directory
WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app ./

# Install production dependencies
RUN bun install --only=production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
