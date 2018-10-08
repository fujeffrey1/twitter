var config = require('../config');

const cassandra = require('cassandra-driver');
const client = new cassandra.Client(config.cassandra);
const Uuid = require('cassandra-driver').types.Uuid;

client.connect(function(err, result) {
  if (err) {
    console.error(err);
  }
});

exports.addMedia = function(req, res, next) {
  let id = Uuid.random();
  const query =
    'INSERT INTO media(id, content, type, size) VALUES (?, ?, ?, ?)';
  const params = [id, req.file.buffer, req.file.mimetype, req.file.size];
  client
    .execute(query, params, { prepare: true })
    .then(result => res.json({ status: 'OK', id: id }))
    .catch(error => res.status(500).json({ status: 'error' }));
};

exports.getMedia = function(req, res, next) {
  const query = 'SELECT content, type, size FROM media WHERE id=?';
  const params = [req.params.id];
  client
    .execute(query, params, { prepare: true })
    .then(result => {
      const { type, size, content } = result.rows[0];
      res.setHeader('Content-Type', type);
      res.setHeader('Content-Length', size);
      res.send(content);
    })
    .catch(error => res.status(500).json({ status: 'error' }));
};

exports.deleteMedia = function(req, res, next) {
  const query = 'DELETE FROM media WHERE id=?';
  const params = [req.params.id];
  client
    .execute(query, params, { prepare: true })
    .then(result => {
      res.json({ status: 'OK' });
    })
    .catch(error => res.status(500).json({ status: 'error' }));
};
