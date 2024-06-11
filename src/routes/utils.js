export const promiseWrapper = (promise) => {
  return new Promise((resolve) => {
    promise.then((res) => resolve({ res })).catch((err) => resolve({ err }));
  });
};
