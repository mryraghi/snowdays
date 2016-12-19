const path = Npm.require('path');
const fs = Npm.require('fs');

Router.route('/files/:filename', function () {
  const filename = this.params.filename;
  const fullPath = path.join(process.cwd(), '../web.browser/app/public_static_files/', filename);

  try {
    const file = fs.readFileSync(fullPath);
    const headers = {
      'Content-type': 'application/pdf',
      'Content-Disposition': "inline; filename=" + this.params.filename
    };

    this.response.writeHead(200, headers);
    return this.response.end(file);
  } catch (error) {
    if (_.isEqual(error.code, 'ENOENT')) {
      this.response.statusCode = 404;
      this.response.statusMessage = 'Not found';
      this.response.end()
    }

    this.response.statusCode = 500;
    this.response.statusMessage = 'Not found';
    this.response.end()
  }
}, {where: 'server'});

Router.route('/files/uploads/IDs/:filename', function () {
  const filename = this.params.filename;
  const fullPath = path.join(process.cwd(), '../web.browser/app/images/uploads/IDs/', filename);

  try {
    const file = fs.readFileSync(fullPath);
    const headers = {
      'Content-type': 'image/*',
      'Content-Disposition': "inline; filename=" + this.params.filename
    };

    this.response.writeHead(200, headers);
    return this.response.end(file, 'binary');
  } catch (error) {
    if (_.isEqual(error.code, 'ENOENT')) {
      this.response.statusCode = 404;
      this.response.statusMessage = 'Not foundeee';
      this.response.end()
    }

    this.response.statusCode = 500;
    this.response.statusMessage = 'Not foundrrr';
    this.response.end()
  }
}, {where: 'server'});