import { Customer } from 'src/entities/customer.entity';

export class CustomerUpdateFields {
  shipping_name: string;
  shipping_mobile: string;
  housenumber_street: string;
  ward_id: string;
}

export class UpdateShippingDto {
  fullname: string;
  mobile: string;
  address: string;
  ward: string;
}

export class EnrichedCustomer extends Customer {
  district_id: string | null;
  province_id: string | null;
}

export class UpdateInfoDto {
  fullname?: string;
  mobile?: string;
  current_password?: string;
  password?: string;
}

export interface LoggedUser {
  id: number;
  email: string;
}
