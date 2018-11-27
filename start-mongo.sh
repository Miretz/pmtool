#!/bin/sh
mongod --dbpath ~/data/db

cd server
yarn dev
cd ..

cd client
yarn serve
cd ..

