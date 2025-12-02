# Use Node.js LTS (Long Term Support) as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
# --omit=dev installs only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define environment variables (can be overridden at runtime)
# PORT is commonly used by cloud providers
ENV PORT=3000
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]
