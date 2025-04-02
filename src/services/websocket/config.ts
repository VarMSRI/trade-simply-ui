
export const WS_CONFIG = {
  URL: "wss://app.intuitifi.com/ws",
  RECONNECT: {
    MAX_ATTEMPTS: 10,
    INTERVAL: 3000
  }
};

export const MESSAGE_TYPES = {
  MARKET_DATA: "marketData",
  ORDER_UPDATE: "orderUpdate",
  CONNECTION_STATUS: "connectionStatus"
};
