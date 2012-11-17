
var epubed = require('./lib/epub-editor');
var epubFile = process.argv[2];

epubed.open(epubFile, function (err, container) {

	// add a js subdir if it doesn't exist

	if(err) {
		throw err;
	}

	container.zip.addDirectory('OEBPS/js');


	// add a JS file to the manifest

	container.zip.addFile('OEBPS/js/main.js', new Buffer('alert("all good");'));

	// add another HTML file that references the JS

	container.zip.addFile('OEBPS/script-test.html', new Buffer('<html><head/><body><script src="js/main.js"></script></body></html>'));

	// add a spine ref for the script, at the end (dont specify position in second arg)

	container.toc.addSpineItem('OEBPS/script-test.html');

	// add a navpoint to the ncx, at specified position (by playOrder)

	container.toc.addNavPoint('OEBPS/script-test.html', 3);

	// write all changes

	container.writeChanges(epubFile+'-modified.zip');


});



