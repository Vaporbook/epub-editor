
var epub, container, toc = null;


function open(filename, cb) {

	require('./epub-container').init(filename, function (err, container) {

		if(err) {
			throw err;
		}

		cb(null, container);

	});
}

function close(filename) {



}

exports.open = open;
