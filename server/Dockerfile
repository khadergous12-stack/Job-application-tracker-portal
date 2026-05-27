FROM node:18-alpine

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
