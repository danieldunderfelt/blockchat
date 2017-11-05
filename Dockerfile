FROM node:8.9

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock

RUN cd /tmp && yarn
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
ADD package.json /opt/app/package.json
ADD yarn.lock /opt/app/yarn.lock
ADD lib /opt/app/lib/
ADD server /opt/app/server/

EXPOSE 3001
EXPOSE 6001

CMD [ "yarn", "run", "start-server" ]