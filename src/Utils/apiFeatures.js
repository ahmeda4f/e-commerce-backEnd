import { paginationFunction } from "./pagination.js";

export class ApiFeatures {
  constructor(query, mongooseQuery) {
    this.query = query;
    this.mongooseQuery = mongooseQuery;
  }

  pagination({ page, size }) {
    const { limit, skip } = paginationFunction({ page, size });
    this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip);
    console.log(this);
    return this;
  }

  sort(sortBy) {
    if (!sortBy) {
      this.mongooseQuery = this.mongooseQuery.sort({ createdAt: -1 });
      return this;
    }
    const sortFormula = sortBy
      .replace(/desc/g, -1)
      .replace(/asc/g, 1)
      .replace(/ /g, ":");

    const [key, value] = sortFormula.split(":");
    this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value });
    return this;
  }

  search(search) {
    const queryFilter = {};
    if (search.title)
      queryFilter.title = { $regex: search.title, $options: "i" };

    if (search.name) queryFilter.name = { $regex: search.name, $options: "i" };

    if (search.slug) queryFilter.slug = { $regex: search.slug, $options: "i" };

    if (search.desc) queryFilter.desc = { $regex: search.desc, $options: "i" };

    if (search.discount) queryFilter.discount = { $ne: 0 };

    if (search.stock) queryFilter.stock = { $ne: 0 };

    if (search.couponCode)
      queryFilter.couponCode = { $regex: search.couponCode, $options: "i" };

    if (search.couponAmount) queryFilter.couponAmount = { $ne: 0 };

    if (search.priceFrom && !search.priceTo)
      queryFilter.appliedPrice = { $gt: search.priceFrom };

    if (search.priceTo && !search.priceFrom)
      queryFilter.appliedPrice = { $lt: search.priceTo };

    if (search.priceFrom && search.priceTo)
      queryFilter.appliedPrice = { $gt: search.priceFrom, $lt: search.priceTo };

    if (search.rateFrom && !search.rateTo)
      queryFilter.rate = { $gt: search.rateFrom };

    if (search.rateTo && !search.rateFrom)
      queryFilter.rate = { $lt: search.rateTo };

    if (search.rateFrom && search.rateTo)
      queryFilter.rate = {
        $gt: search.rateFrom,
        $lt: search.rateTo,
      };

    this.mongooseQuery = this.mongooseQuery.find(queryFilter);
    return this;
  }
  filter(filters) {
    const filterOptions = JSON.stringify(filters).replace(
      /\b(gte|gt|lt|lte|ne|regex)\b/g,
      (operator) => `$${operator}`
    );
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(filterOptions));
    return this;
  }
}
