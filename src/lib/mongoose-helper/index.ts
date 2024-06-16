import { get, isArray, isNil, merge, set } from 'lodash';
import mongoose, { Schema } from 'mongoose';
import mongooseHidden from 'mongoose-hidden';

export function helper(schema: Schema): Schema {
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });
  schema.set('timestamps', {
    createdAt: 'createAt',
    updatedAt: 'updateAt',
  });
  schema.plugin(
    mongooseHidden({
      hidden: { _id: true },
    })
  );
  return schema;
}

function wrapValue(val, isRegex) {
  if (isArray(val)) return { $in: val.map((i) => wrapValue(i, isRegex)) };
  if (isNil(val) || typeof val !== 'string') return val;
  val = val.trim();
  if (val && isRegex) {
    // eslint-disable-next-line no-useless-escape
    return new RegExp(val.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
  }

  switch (val.toLowerCase()) {
    case '*':
      val = { $ne: [] };
      break;
    case 'none':
      val = { $eq: [] };
      break;
    default:
  }

  return val;
}

export function buildMongooseQuery(query) {
  const {
    _limit: limit,
    _offset: offset,
    _sort: sort,
    _select: select,
    _group: group,
    _count: count,
    _embed: embed = [],
    _expand: expand = [],
    ...raw
  } = query;

  // reference https://github.com/36node/sketch/blob/master/docs/url.md
  const filter = Object.keys(raw).reduce((acc, key) => {
    let val = raw[key];

    // 处理一下布尔值
    if (val === 'false') val = false;
    if (val === 'true') val = true;

    let path = key === 'id' ? '_id' : [key];
    let isRegex = false;

    // `_exists`
    if (key.endsWith('_exists')) {
      path = [key.slice(0, -7), '$exists'];
    }

    // `_like _not`
    let match = /(.+)_(like|not)/.exec(key);
    if (match) {
      path = [match[1]];
      isRegex = true;
    }

    // `_start`
    match = /(.+)_(start)/.exec(key);
    if (match) {
      path = [match[1]];
      val = new RegExp(`^${val}`);
    }

    // `_scope`
    match = /(.+)_(scope)/.exec(key);
    if (match && val) {
      path = [match[1]];
      val = new RegExp(`^${val}(?:\/.*)?$`);
    }

    // `_gt`, `_lt`, `_gte` `_lte` `_ne` `_size`
    match = /(.+)_(gt|lt|gte|lte|ne|size)$/.exec(key);
    if (match) {
      path = [match[1], `$${match[2]}`];
    }

    if (key === 'q') {
      path = '$text';
      val = { $search: val };
    }

    return set(acc, path, wrapValue(val, isRegex));
  }, {});

  return {
    limit: limit ? Number(limit) : limit,
    offset: offset ? Number(offset) : offset,
    sort,
    populate: [].concat(embed).concat(expand) as string[],
    select,
    group,
    count,
    filter,
  };
}

const getDateGroupId = (field, scope) => {
  switch (scope) {
    case 'year':
      return { year: { $year: { date: `$${field}`, timezone: '+08:00' } } };
    case 'month':
      return { month: { $month: { date: `$${field}`, timezone: '+08:00' } } };
    case 'week':
      return { week: { $week: { date: `$${field}`, timezone: '+08:00' } } };
    case 'day':
      return { day: { $dayOfMonth: { date: `$${field}`, timezone: '+08:00' } } };
    case 'hour':
      return { hour: { $hour: { date: `$${field}`, timezone: '+08:00' } } };
  }
};

export const unWindGroupId = (groupId) => {
  const result: any = {};
  Object.keys(groupId).forEach((key) => {
    result[key] = `$_id.${key}`;
  });
  return result;
};

export const genAggGroupId = (group = []) =>
  [].concat(group).reduce((acc, cur) => {
    const match = /(.+)_(hour|day|week|month|year)$/.exec(cur);
    if (match) {
      return merge(acc, { [match[1]]: getDateGroupId(match[1], match[2]) });
    }

    /**
     * 目前只能支持一级嵌套字段，例如
     *
     * `user.name` => `{ user: { name: '$user.name' } }`
     */
    if (cur.includes('.')) {
      const [suc, des] = cur.split('.');
      return { ...acc, [suc]: { [des]: `$${cur}` } };
    }

    return { ...acc, [cur]: `$${cur}` };
  }, {});

export const transformDate = (query, path) => {
  const val = get(query, path);
  if (val) {
    set(query, path, new Date(val));
  }
};

export const transformObjectId = (query, path) => {
  const val = get(query, path);
  if (val) {
    set(query, path, new mongoose.Types.ObjectId(val));
  }
};

export const genSort = (sort: string | string[]): Record<string, 1 | -1> => {
  if (isArray(sort)) {
    return (sort as string[]).reduce((acc, cur) => {
      return { ...acc, ...genSort(cur) };
    }, {});
  }

  const sortStr = sort as string;
  if (sortStr.startsWith('-')) {
    return { [sortStr.slice(1)]: -1 };
  }
  return { [sortStr]: 1 };
};
