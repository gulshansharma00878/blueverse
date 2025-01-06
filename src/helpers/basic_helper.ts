import { pick, isArray } from 'lodash';

export const dataFromRequest = function (req: any, properties?: any) {
  if (!properties) {
    properties = [];
  } else if (!isArray(properties)) {
    properties = [properties];
  }

  let propMap = Object.assign(req.query, { ...req.body, ...req.params });
  propMap = properties.length ? pick(propMap, properties) : propMap;
  return properties.length === 1 ? propMap[properties[0]] : propMap;
};

export const createResponseObject = (
  res: any,
  msg: string = '',
  data: any = [],
  code: number = 200
) => {
  res.status(code);

  let resJson = {
    code: 0,
    status: 200,
    message: msg,
    data,
    error: false,
  };
  if (data) {
    resJson.data = data;
  }
  return res.json(resJson);
};
