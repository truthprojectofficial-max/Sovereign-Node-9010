# SOVEREIGN NODE 9010 - CONTAINERIZATION MANIFEST (WRAP AND PACK)
# BASE: Node 20 Alpine (Minimal surface area for security)

FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build phase)
RUN npm ci

# Copy source architecture
COPY . .

# Execute static build for Vite frontend
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS runtime

WORKDIR /app

# Inherit dependency manifests
COPY package.json package-lock.json* ./

# Install strictly production dependencies
RUN npm ci --omit=dev

# We require 'tsx' to execute the server.ts directly in this configuration
RUN npm install tsx

# Copy the Express gateway & compiled Vite frontend
COPY server.ts ./
COPY --from=builder /app/dist ./dist

# Final lock of file permissions
RUN addgroup -S taasgroup && adduser -S taasuser -G taasgroup
RUN chown -R taasuser:taasgroup /app
USER taasuser

# Establish deterministic port exposure
EXPOSE 3000

# Execute BBFB Engine Gateway
CMD ["npm", "start"]
