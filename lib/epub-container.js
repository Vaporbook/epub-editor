
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var parser = require('epub-parser');
var epubdata;
var fs = require('fs');
var zipContainer = null;
var zipFileName = null;

var opfDom, ncxDom;

module.exports.init = function init(zipfile, cb) {
	parser.open(zipfile, function (err, epub) {


		epubdata = epub;

		if(err) return cb(err);
		zipFileName = zipfile;
		zipContainer = parser.getZip(); // gets instance of node-zip class

		opfDom = new DOMParser().parseFromString(epubdata.raw.xml.opfXML,'text/xml');
		ncxDom = new DOMParser().parseFromString(epubdata.raw.xml.ncxXML,'text/xml');

		cb(null,{

			zip: {
				getEntries: getEntries,
				deleteFile: deleteFile,
				addFile: addFile,
				addDirectory: addDirectory,
				updateFile: updateFile
			},
			toc: {
				addSpineItem: addSpineItem,
				addNavPoint: addNavPoint
			},
			writeChanges: writeChanges


		});

	});
}

function getEntries() {
	return zipContainer.getEntries();
}

function deleteFile(filename) {
	zipContainer.remove(filename);
}

function addFile(filename, buffer) {
	// TODO clean up filename, verify buffer
	zipContainer.file(filename, buffer.toString());
	var item = opfDom.createElementNS('http://www.idpf.org/2007/opf','item');
	item.setAttribute('href', filename);
	item.setAttribute('media-type', mimeFromName(filename));
	item.setAttribute('id', idFromName(filename));
	opfDom.getElementsByTagNameNS('http://www.idpf.org/2007/opf', 'manifest').item(0).appendChild(item);

}

function addDirectory(dirname) {
	// TODO strip slash from dirname
	zipContainer.folder(dirname);
}

function updateFile(filename, buffer) {
	// TODO clean up filename, verify buffer

	zipContainer.file(filename, buffer.toString());
	var items = opfDom.getElementsByTagNameNS('http://www.idpf.org/2007/opf', 'item');
	for(var i = 0; i < items.length; i++) {
		var item = items.item(i);
		if(item.getAttribute('href')==filename) {
			item.setAttribute('media-type', mimeFromName(filename));
		}
	}
 
}

function updateOpf(filename, buffer) {
	// TODO clean up filename, verify buffer
	zipContainer.file(filename, buffer.toString());
 
}

function addSpineItem(filename, order) {

}

function addNavPoint(filename, playOrder) {

}

function writeChanges() {
	var filename = (arguments[0]) ? arguments[0] : zipFileName;

	// write opf and ncx

	var newOpf = new XMLSerializer().serializeToString(opfDom);
	var newNcx = new XMLSerializer().serializeToString(ncxDom);

	console.log('updating ncx file [ '+ epubdata.paths.ncxPath+' ] ...');
	updateFile( epubdata.paths.ncxPath, new Buffer(newNcx));

	console.log('updating opf file [ '+epubdata.paths.opfPath+' ] ...');
	updateOpf( epubdata.paths.opfPath, new Buffer(newOpf));

	fs.writeFile(filename, zipContainer.generate({base64:false,compression:'DEFLATE'}), 'binary');

}


function idFromName(name) {

	return name.replace(/[^A-Za-z]/, '')+(new Date()).getTime();

}

function mimeFromName(name) {

	var extension = name.replace(/\.[^\.]{2-4}$/);

	switch(extension) {

		case 'ncx':
			return 'application/x-dtbncx+xml';
		case 'xml':
			return 'application/xhtml+xml';
		case 'html':
			return 'application/xhtml+xml';
		case 'xhtml':
			return 'application/xhtml+xml';
		case 'jpg':
			return 'image/jpeg';
		case 'jpeg':
			return 'image/jpeg';
		case 'gif':
			return 'image/gif';
		case 'png':
			return 'image/png';
		case 'svg':
			return 'application/svg+xml';
		case 'ttf':
			return 'application/x-opentype-font';
		case 'js':
			return 'text/javascript';
		case 'css':
			return 'text/css';
		case 'txt':
			return 'text/plain';
		default:
			return 'application/octet-stream';

	}
}


