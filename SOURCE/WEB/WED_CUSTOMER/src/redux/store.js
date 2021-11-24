import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware, { SagaMiddleware, Task } from "redux-saga";
import { rootReducer } from "./reducers";
import { rootSaga } from "./sagas";

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension");
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

export const makeStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(rootReducer, bindMiddleware([sagaMiddleware]));
  sagaMiddleware.run(rootSaga);
  return store;
};
