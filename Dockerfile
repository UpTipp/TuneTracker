FROM node:18

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Fix potential file permissions
RUN chmod -R 777 .

# Set build environment variables
ENV CI=false
ENV NODE_ENV=production

# Build the React app
RUN npm run build

# Create upload directories
RUN mkdir -p uploads/tunes uploads/sets uploads/sessions

EXPOSE 3002

# Start the server
CMD ["npm", "run", "start:prod"]