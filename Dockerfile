FROM node:16

COPY  ./package.json /survey-maker/
COPY  ./yarn.lock /survey-maker/

WORKDIR /survey-maker/

RUN yarn install


COPY . /survey-maker/

CMD yarn start:dev