FROM node:14
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY index.js ./
COPY isValidTimestamp.js ./
COPY mongostore.js ./
RUN yarn

EXPOSE 3000

CMD [ "node", "index.js" ]
