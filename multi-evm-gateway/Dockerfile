# Multi-stage build for security and efficiency
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy dependencies from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --chown=nextjs:nodejs . .

# Remove unnecessary files
RUN rm -rf tests/ docs/ *.md .git/

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "gateway/app.js"]