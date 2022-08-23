import * as actionType from "../utils/actionTypes";

const authReducer = (
  state = { authData: null, loading: false, success: false, errors: false },
  action
) => {
  switch (action.type) {
    case actionType.LOADING_AUTH:
      return { ...state, loading: true };
    case actionType.ERROR_AUTH:
      return {
        ...state,
        authData: null,
        loading: false,
        success: false,
        errors: true,
      };
    case actionType.AUTH:
      localStorage.setItem("profile", JSON.stringify({ ...action?.data }));
      return {
        ...state,
        authData: action.data,
        loading: false,
        success: true,
        errors: false,
      };
    case actionType.LOGOUT:
      localStorage.clear();
      return { ...state, authData: null, loading: false, errors: false };
    case actionType.ADOPT:
      const userInfo = JSON.parse(localStorage.getItem("profile"));
      const newUpdatedUserInfo = {
        ...userInfo,
        result: action.data,
      };
      localStorage.setItem("profile", JSON.stringify(newUpdatedUserInfo));
      return { ...state, authData: action.data, loading: false, errors: null };
    case actionType.DONATE:
      return { ...state, donations: action.data };
    case actionType.PULL_DONATION:
      return { ...state, donations: action.data };
    default:
      return state;
  }
};

export default authReducer;
