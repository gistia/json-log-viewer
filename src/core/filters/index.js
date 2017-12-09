class Filter {
  constructor(field, value) {
    this.field = field;
    this.value = value;
  }

  apply(line) {
    const fieldValue = line[this.field];

    if (!fieldValue) {
      return false;
    }

    return fieldValue.toLowerCase() === this.value.toLowerCase();
  }
}

module.exports = Filter;
module.exports.ContainsFilter = require('./contains');
