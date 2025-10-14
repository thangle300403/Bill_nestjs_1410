export class ProvinceDto {
  id: string;
  name: string;
  type: string;
}

export class WardDto {
  id: string;
  name: string;
  type: string;
  provinceId: string;
}

// delivery-info.interface.ts
export class DeliveryInfo {
  fullname: string;
  mobile: string;
  province: string;
  ward: number;
  address: string;
  payment_method: number;
}
