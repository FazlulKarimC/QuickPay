const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@repo/ui", "@repo/store", "@repo/db"],
};
