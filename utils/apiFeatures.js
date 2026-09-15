class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // 1A) Create shallow copy & exclude reserved keys
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering ($gte, $gt, $lte, $lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const finalQuery = JSON.parse(queryStr);

    // 1C) Dynamic text search based on Model Context
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, 'i');

      // Check if query target is User vs Review vs Tour
      const modelName = this.query.model.modelName;

      if (modelName === 'User') {
        finalQuery.$or = [{ name: searchRegex }, { email: searchRegex }];
      } else if (modelName === 'Review') {
        finalQuery.review = searchRegex;
      } else if (modelName === 'Tour') {
        finalQuery.name = searchRegex;
      }
    }

    // 1D) Handle numeric rating filter
    if (this.queryString.rating && this.queryString.rating !== 'all') {
      finalQuery.rating = Number(this.queryString.rating);
    }

    // Pass final constructed query object to Mongoose
    this.query = this.query.find(finalQuery);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
