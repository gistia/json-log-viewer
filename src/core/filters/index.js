class Filter {
  constructor(field, value) {
    this.field = field;
    this.value = value;
  }
}

module.exports = Filter;
module.exports.ContainsFilter = require('./contains');
