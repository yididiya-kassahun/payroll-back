# Dockerfile for backend
FROM node:18-alpine  
# Node.js version

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your Express app is listening on
EXPOSE 5000

# Command to start the application
CMD ["npm", "start"]