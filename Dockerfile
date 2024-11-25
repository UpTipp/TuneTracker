FROM node:18

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Install tsx globally
RUN npm install -g tsx

# Create upload directories
RUN mkdir -p uploads/tunes uploads/sets uploads/sessions

# Build the React app
RUN npm run build

EXPOSE 3001

# Start using tsx
CMD ["tsx", "server.ts"]