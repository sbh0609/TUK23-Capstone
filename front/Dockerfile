FROM node:18

WORKDIR /frontend

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

CMD ["yarn", "start"]