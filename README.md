# reactive-koffeeshop-demo
A clone of https://github.com/cescoffier/reactive-coffeeshop-demo in JS


## How to run


```
cd reactive-koffeeshop-demo 
./install.sh
```
Open a new terminal and

```
podman-compose up
```
Open a new terminal and

```
./create-topics.sh
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