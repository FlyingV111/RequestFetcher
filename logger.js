const chalk = require('chalk');

const logger = {
  log(message) {
    console.log(message);
  },

  warning(message) {
    console.log(chalk.yellow(message));
  },

  error(message) {
    console.log(chalk.red(message));
  },

  /**
   * Logs the given message in a custom color.
   * The color can be a hex code (e.g. '#ff0000') or any CSS color name.
   */
  custom(message, color) {
    if (!color) {
      console.log(message);
      return;
    }

    let colorizer;
    if (color.startsWith('#')) {
      colorizer = chalk.hex(color);
    } else {
      colorizer = chalk.keyword(color);
    }

    console.log(colorizer(message));
  }
};

module.exports = logger;
