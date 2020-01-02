const nanoid = require('nanoid/generate');

function nanoidPlugin(schema, options) {
  if (schema.options._id !== undefined && schema.options._id === false) return;

  length = (options && options.length) || 12;

  customAlpha = (options && options.customAlpha) || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let _id = '_id';
  const dataObj = {};

  dataObj[_id] = {
    type: String,
    default: function() {
      return nanoid(customAlpha, length);
    },
  };

  schema.add(dataObj);
  schema.pre('save', function(next) {
    if (this.isNew && !this.constructor.$isArraySubdocument) {
      attemptToGenerate(this, customAlpha, length)
        .then(function(newId) {
          this[_id] = newId;
          next();
        })
        .catch(next);
    } else next();
  });
}

function attemptToGenerate(doc, customAlpha, length) {
  const id = nanoid(customAlpha, length);
  return doc.constructor.findById(id).then(function(found) {
    if (found) return attemptToGenerate(doc, length);
    return id;
  });
}

module.exports = nanoidPlugin;
