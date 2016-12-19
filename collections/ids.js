//noinspection JSAnnotator
IDs = new FilesCollection({
  storagePath: 'images/uploads',
  // To preserve files in development mode store them outside of the Meteor application, e.g. /data/Meteor/uploads/
  downloadRoute: 'images/uploads/',
  chunkSize: 1024 * 2048,
  throttle: 1024 * 512,
  permissions: 0755,
  collectionName: 'IDs',
  allowClientCode: true,
  cacheControl: 'public, max-age=31536000',
  onbeforeunloadMessage: function () {
    return 'Upload is still in progress! Upload will be aborted if you leave this page!';
  },
  onBeforeUpload: function (file) {
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  },
  downloadCallback: function (fileObj) {
    if (this.params.query.download === 'true') {
      return IDs.update(fileObj._id, {
        $inc: {
          'meta.downloads': 1
        }
      });
    } else {
      return true;
    }
  },
  protected: function (fileObj) {
    return !!fileObj.meta.owner === this.userId
  }
});

IDs.collection.attachSchema(new SimpleSchema(IDs.schema));