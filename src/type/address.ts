export class ProvinceDto {
  id: string;
  name: string;
  type: string;
}

export class DistrictDto {
  id: string;
  name: string;
  type: string;
  provinceId: string;
}

export class WardDto {
  id: string;
  name: string;
  type: string;
  districtId: string;
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
