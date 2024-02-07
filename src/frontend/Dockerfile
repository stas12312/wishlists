FROM node:20-alpine

EXPOSE 3000

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

CMD ["npm", "start"]
