#!/usr/bin/env bash

# Copy from https://github.com/cescoffier/reactive-coffeeshop-demo/blob/master/create-topics.sh

kafka-topics --bootstrap-server localhost:9092 --create --partitions 4 --replication-factor 1 --topic orders
kafka-topics --bootstrap-server localhost:9092 --list