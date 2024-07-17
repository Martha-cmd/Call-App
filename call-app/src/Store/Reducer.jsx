const initialState = {
    user: null,
    callRate: 0.1, // charge rate per second
    call: null,
  };
  
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case "CALL_INITIATED":
        return {
          ...state,
          call: {
            caller: action.payload.caller,
            receiver: action.payload.receiver,
            startTime: action.payload.startTime,
            callRate: action.payload.callRate,
          },
        };
      case "CALL_ENDED":
        return {
          ...state,
          call: null,
        };
      default:
        return state;
    }
  };
  
  export default reducer;
  