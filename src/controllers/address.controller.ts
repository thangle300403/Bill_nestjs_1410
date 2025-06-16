import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { AddressService } from 'src/services/address.service';

@Controller('api/v1')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('provinces')
  async getProvinces(@Res() res: Response) {
    try {
      const provinces = await this.addressService.getAllProvinces();
      return res.json(provinces);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định.';
      return res.status(500).json({
        message: 'Lỗi khi lấy phí ship.',
        error: message,
      });
    }
  }

  @Get('districts/province/:provinceId')
  async getDistricts(
    @Param('provinceId') provinceId: string,
    @Res() res: Response,
  ) {
    try {
      const districts =
        await this.addressService.getDistrictsByProvinceId(provinceId);
      return res.json(districts);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định.';
      return res.status(500).json({
        message: 'Lỗi khi lấy phí ship.',
        error: message,
      });
    }
  }

  @Get('wards/district/:districtId')
  async getWards(
    @Param('districtId') districtId: string,
    @Res() res: Response,
  ) {
    try {
      const wards = await this.addressService.getWardsByDistrictId(districtId);
      return res.json(wards);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định.';
      return res.status(500).json({
        message: 'Lỗi khi lấy phí ship.',
        error: message,
      });
    }
  }
}
