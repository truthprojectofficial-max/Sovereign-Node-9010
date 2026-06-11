# Use Node.js 20 as the base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies (including Python for integrity checks)
RUN apt-get update && apt-get install -y \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the frontend
RUN npm run build

# Set environment to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Start the Sovereign Node
CMD ["npm", "run", "dev"]
