FROM node:8.16-stretch

RUN mkdir -p /usr/src/app
RUN mkdir -p /data/db
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN mkdir -p /var/log/supervisor
RUN apt-get update \
 && apt-get install -y mongodb \
  && apt-get install -y build-essential \
  && apt-get install -y python make g++ \
  && apt-get install -y supervisor

RUN npm install -g node-gyp
RUN npm install --unsafe-perm=true -g bcrypt 
RUN yarn global add @vue/cli

RUN cd server/ && yarn install
RUN cd client/ && yarn install

EXPOSE 8080
EXPOSE 5500

ADD supervisor.conf /etc/supervisor.conf
CMD ["supervisord", "-c", "/etc/supervisor.conf"]