#! /usr/bin/node

const { default: Axios } = require('axios');
const cr = require('cheerio');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PAGE_URL = 'https://mn350action.org/bad-for-business';

const loadToCheerio = (html) => cr.load(html);

const selectLinkElements = ($) => $('link');

const filterOutNonStylesheets = (jqLinks) =>
    jqLinks.filter("[rel='stylesheet']");

const writePath = path.join(__dirname, 'scrapedStyles.txt');

const writer = fs.createWriteStream(writePath);

const writeLink = (idx, el) => {
    const str = cr.html(el);
    writer.write(str + '\n');
};

const printStyleLinks = (styleLinks) => styleLinks.each(writeLink);

const getHTML = (url) => axios.get(PAGE_URL).then((res) => res.data);

// debugging util
const printFromChain = (x) => {
    console.log(x);
    return x;
};

const exec = () =>
    getHTML(PAGE_URL)
        .then(loadToCheerio)
        .then(selectLinkElements)
        .then(filterOutNonStylesheets)
        .then(printStyleLinks);

exec();
