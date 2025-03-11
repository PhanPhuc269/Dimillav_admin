const Handlebars = require('handlebars');
const User = require('@components/auth/models/Admin');
const { mutipleMongooseToObject } = require('../utils/mongoose');
const { mongooseToObject } = require('../utils/mongoose');

module.exports={
    sum: (a, b) => a + b,
    sortable: (field, sort) => {
      const sortType = field === sort.column ? sort.type : 'default';

      const icons = {
        default: 'fa-solid fa-sort',
        asc: 'fa-solid fa-arrow-down-short-wide',
        desc: 'fa-solid fa-arrow-down-wide-short',
      };

      const types = {
        default: 'desc',
        asc: 'desc',
        desc: 'asc',
      };

      const icon = icons[sortType];
      const type = types[sortType];


      const href = Handlebars.escapeExpression(`?_sort&column=${field}&type=${type}`);

      const output = `<a href="${href}" data-field="${field}" data-type="${type}">
          <i class="${icon}"></i>
        </a>`;
      return new Handlebars.SafeString(output);
    },

    eq: (a, b) => a === b,
    formatDuration:(seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        },
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    multiply: (a, b) => a * b,
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    ifEquals: (a, b, options) => (a === b ? options.fn(this) : options.inverse(this)),
    createPagination: (currentPage, totalPages) => {
      let pages = [];
      for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
      }
      return pages;
    },   
    formatDate: function (date) {
      const d = new Date(date);
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      return `${d.getFullYear()}-${month}-${day}`;
    },
    range: (start, end) => {
      let rangeArray = [];
      for (let i = start; i <= end; i++) {
        rangeArray.push(i);
      }
      return rangeArray;
    },     
    ternary: (condition, trueValue, falseValue) => {
      return condition ? trueValue : falseValue;
    },
    toNumber: (value) => {
     return Number(value);
    },
    not : (value) => {
      return !value;
    },
    includes: (array, value) => {
        if (Array.isArray(array)) {
            return array.includes(value);
        }
        return false;
    },
    // Removed any status-related helpers
        // Helper function to get file name from URL (register this on server-side Handlebars if needed)
    getFileName: (url)=> {
        return url.split('/').pop();
    },
    //Định dạng tiền Việt Nam
    formatPrice: function (price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    
    join: (array, separator = ', ') => {
      if (Array.isArray(array)) {
          return array.join(separator);
      }
      return '';
    },
    // Helper mới: formatCurrency
    formatCurrency: function (amount) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },
      // Helper mới: getFirstImage
      getFirstImage: (images) => {
      return images && images.length > 0 ? images[0] : '/path/to/default-image.jpg';
    },
    formatDate: function(isoString) {
      const date = new Date(isoString);
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
      return date.toLocaleDateString('en-US', options);
    },
    // Helper mới: formatTime
    formatTime: function (isoString) {
      const date = new Date(isoString);
      const now = new Date();
  
      // Kiểm tra nếu là thời gian trong ngày hôm nay
      if (date.toDateString() === now.toDateString()) {
          // Hiển thị giờ
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else {
        // Hiển thị ngày theo định dạng dd/MM
        const day = date.getDate();
        const month = date.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
        return `${day}/${month}`;
      }
  },
}