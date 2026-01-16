import { getBody } from "./get-body.middleware.js";

const compose = (middlewares) => async (req, res, finalHandler) => {
  let index = -1;

  async function dispatch(i) {
    if (i <= index) {
      throw new Error("next() chamado múltiplas vezes");
    }

    index = i;
    const fn = middlewares[i] || finalHandler;

    if (!fn) return;

    await fn(req, res, async () => await dispatch(i + 1));
  }

  await dispatch(0);
};

const middlewares = compose([getBody]);

export { middlewares };
