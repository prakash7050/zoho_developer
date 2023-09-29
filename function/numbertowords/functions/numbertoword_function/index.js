"use strict"
const { ToWords } = require('to-words');
const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: { // can be used to override defaults for the selected locale
      name: 'Rupee',
      plural: 'Rupees',
      symbol: '₹',
      fractionalUnit: {
        name: 'fills',
        plural: 'fills',
        symbol: '',
      },
    }
  }
});
app.use(express.json());



app.all("/parse", (req,res) => {

	const number = parseFloat(req.query.number);
	const currency = req.query.currency.toString();

	let convertCurrency  = toWords.convert(number, { currency: true });;
	// convertCurrency = convertCurrency[0].toUpperCase() + convertCurrency.slice(1);
	let finalRender = `${currency} ${convertCurrency}.`
	

	res.status(200).send( JSON.stringify({"data":finalRender, "code":200}) );

});

module.exports = app;



/* 'use strict';

var converter = require('number-to-words');

var _ = require('loadsh')

const express = require('express')
const app = express()

// respond with "hello world" when a GET request is made to the homepage
app.get('/parse', (req, res) => {
  res.send('hello world')
})







module.exports = (req, res) => {
	
	let url = req.url;
	console.log(url);
	console.log(`<<222<`,req.query)
	const number = parseFloat(req.query.number);
	const currency = req.query.currency.toString();
			
	//var numbertToWords = `${} only`;
	//res.write(`<h1>${__[0].toUpperCase()}${__.slice(1)} only.<h1>`);
	switch (url) {
		case '/parse':
			// const number = 200;
			let __ = converter.toWords(number);
			
			
			res.writeHead(200, { 'Content-Type': 'text/html' });
			// console.log(`<<<<<<<<<<`,number,currency);
	//		res.send(__);	
			//res.write(`<h1>${__[0].toUpperCase()}${__.slice(1)} only.<h1>`);
			break;
		default:
			res.writeHead(404);
			res.write('You might find the page you are looking for at "/" path');
			break;
	}
	res.end();
};
 */