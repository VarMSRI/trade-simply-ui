
export type OrderType = 'MARKET' | 'LIMIT' | 'GTT' | 'SHORT_SELL' | 'COVER';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED';

export interface OrderRequest {
  instrumentToken: number;
  orderType: OrderType;
  quantity: number;
  price?: number;
  stoplossTriggerPrice?: number;
  stoplossLimitPrice?: number;
  stoplossQuantity?: number;
  targetTriggerPrice?: number;
  targetLimitPrice?: number;
  targetQuantity?: number;
}

export interface Order {
  id: string;
  userId: string;
  instrumentToken: number;
  quantity: number;
  price: number;
  orderType: OrderType;
  status: OrderStatus;
  stoplossTriggerPrice?: number;
  stoplossLimitPrice?: number;
  stoplossQuantity?: number;
  targetTriggerPrice?: number;
  targetLimitPrice?: number;
  targetQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersFilter {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
