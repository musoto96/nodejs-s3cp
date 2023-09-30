FROM node:current

WORKDIR /s3cp

COPY package.json .

RUN npm install

COPY . .

RUN mv .aws ~/

CMD ["node", "./index.js"]
