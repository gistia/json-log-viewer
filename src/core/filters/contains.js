const Filter = require('.');

class ContainsFilter extends Filter {
  constructor(field, value, sensitive=false) {
    super(field, value);
    this.sensitive = sensitive;
  }

  apply(line) {
    const fieldValue = line[this.field];

    if (!fieldValue) {
      return false;
    }

    if (this.sensitive) {
      return fieldValue.indexOf(this.value) > -1;
    }

    return fieldValue.toLowerCase().indexOf(this.value.toLowerCase()) > -1;
  }
}

module.exports = ContainsFilter;
