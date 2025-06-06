FROM node:22.12.0

WORKDIR /react

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=8888

EXPOSE 8888

CMD [ "npm", "run", "dev"]

