const http = require('http');
const fs = require('fs');
const express = require('express');
const { error } = require('console');
const app = express();
const port = 5500;
const fileReaderAsync = require('./fileReader');
const fileWriterAsync = require('./fileWriter');

const path = require('path');
const orderPath = path.join(`${__dirname}/orders.json`);

app.use(express.json());
app.use(express.static(`./frontend`));
app.use("/pizza", express.static(`${__dirname}/frontend`));

app.get("/", (req, res)=> {
    res.sendFile(`${__dirname}/frontend/index.html`);
});

app.get("/api/pizza", (req, res)=> {
    res.sendFile(`${__dirname}/pizza.json`);
});
 
app.get("/api/allergen", (req, res)=> {
    res.sendFile(`${__dirname}/allergens.json`);
});

app.get("/pizza/list", (req, res) => {
    res.sendFile(`${__dirname}/frontend/pizzalist.html`);
});

app.get("/api/order", (req, res)=> {
    res.sendFile(`${__dirname}/orders.json`);
});

app.post("/api/order", async (req, res)=> {
    const fileData = await fileReaderAsync(orderPath);
    const orders = JSON.parse(fileData);
    orders.orderList.push(req.body);
    fileWriterAsync(orderPath, JSON.stringify(orders));
    res.send(orders);    
});

app.listen(port, ()=> {
    console.log(`App is listening on http://localhost:${port}`);
});