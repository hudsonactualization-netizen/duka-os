FROM ghcr.io/puppeteer/puppeteer:latest

USER root

# Install dependencies for WhatsApp-Web.js
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["node", "index.js"]
