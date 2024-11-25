FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p uploads/tunes uploads/sets uploads/sessions

EXPOSE 3000

# Use the new start:prod script
CMD ["npm", "run", "start:prod"]