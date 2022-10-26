# reactive-koffeeshop-demo
A clone of https://github.com/cescoffier/reactive-coffeeshop-demo in JS


## How to run


```
cd reactive-koffeeshop-demo 
./install.sh
```
Open a new terminal and

```
docker-compose up
```

After that we need to enter on interactive shell and create topics

```
docker ps
CONTAINER ID   IMAGE                                      COMMAND                  CREATED          STATUS          PORTS                                       NAMES
3a2c7aab2b4b   quay.io/strimzi/kafka:0.24.0-kafka-2.8.0   "sh -c 'bin/kafka-se…"   11 minutes ago   Up 11 minutes   0.0.0.0:9092->9092/tcp, :::9092->9092/tcp   reactive-koffeeshop-demo_kafka_1
6cce7de1175e   quay.io/strimzi/kafka:0.24.0-kafka-2.8.0   "sh -c 'bin/zookeepe…"   11 minutes ago   Up 11 minutes   0.0.0.0:2181->2181/tcp, :::2181->2181/tcp   reactive-koffeeshop-demo_zookeeper_1
```

```
docker exec -ti reactive-koffeeshop-demo_kafka_1 /bin/bash
[kafka@3a2c7aab2b4b kafka]$ cd bin
[kafka@3a2c7aab2b4b bin]$ ./kafka-topics.sh --bootstrap-server localhost:9092 --create --partitions 4 --replication-factor 1 --topic orders
Created topic orders.
exit
```

```
cd koffeeshop-service
npm start
```
Open a new terminal and

```
cd barista-http
npm start
```
Open a new terminal and

```
cd barista-kafka
npm start
```

Open in your browser:

* [Barista HTTP](http://localhost:8081)
* [Koffeeshop Service](http://localhost:8080)

