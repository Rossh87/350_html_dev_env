#! /usr/bin/node

// const pipe = (...fns) => (initInput) => fns.reduce((y, fn) => fn(y), initInput);

const cr = require('cheerio');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

// file path vars
const PATH_TO_TEMPLATE = path.join(process.cwd(), 'src', 'template.html');
const PATH_TO_SCRAPED_STYLES = path.join(
    process.cwd(),
    'scripts',
    'scrapedStyles.txt'
);
const PATH_TO_DEV_STYLES_DIR = path.join(process.cwd(), 'styles');
const TEMP_PATH_TO_JOINED_LINKS = path.join(
    process.cwd(),
    'assets',
    'tempLinks.html'
);
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'builtTemplate.html');

// write scraped link tags to temporary file
const writeScraped = (scraped) =>
    fsp.writeFile(TEMP_PATH_TO_JOINED_LINKS, scraped);

const writeScrapedStyles = () =>
    fsp.readFile(PATH_TO_SCRAPED_STYLES).then(writeScraped);

// write dev-added link tags to temporary file
const toLinkTag = (_, fileName) =>
    `<link rel="stylesheet" href="/styles/${fileName}">`;

const filesToHTMLString = (files) => files.map(toLinkTag).join('\n');

const writeHTMLLinks = (links) =>
    fsp.writeFile(TEMP_PATH_TO_JOINED_LINKS, links, { flag: 'a' });

const writeDevStyles = () =>
    fsp
        .readdir(PATH_TO_DEV_STYLES_DIR)
        .then(filesToHTMLString)
        .then(writeHTMLLinks);

// Get html template and load it into Cheerio
const getTemplate = () =>
    fsp.readFile(PATH_TO_TEMPLATE).then((tp) => tp.toString());

const forwardTemplateWithStyles = (template) => [
    cr.load(template),
    fsp.readFile(TEMP_PATH_TO_JOINED_LINKS).then,
];

const appendStylesToDOM = ([$, linksPromise]) =>
    linksPromise.then((links) => {
        $('head').append(links);
        return $;
    });

const writeFinal = ($) => fsp.writeFile(OUTPUT_PATH, $.html());

const appendAndWriteOutput = () =>
    getTemplate()
        .then(forwardTemplateWithStyles)
        .then(appendStylesToDOM)
        .then(writeFinal);

const exec = () =>
    writeScrapedStyles().then(writeDevStyles).then(appendAndWriteOutput);

exec();
