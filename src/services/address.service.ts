import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { District } from 'src/entities/district.entity';
import { Province } from 'src/entities/province.entity';
import { Ward } from 'src/entities/ward.entity';
import { DistrictDto, ProvinceDto, WardDto } from 'src/type/address';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,

    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  async getAllProvinces(): Promise<ProvinceDto[]> {
    return await this.provinceRepository.find();
  }

  async getDistrictsByProvinceId(provinceId: string): Promise<DistrictDto[]> {
    const paddedProvinceId = provinceId.toString().padStart(2, '0');
    return await this.districtRepository.find({
      where: { provinceId: paddedProvinceId },
    });
  }

  async getWardsByDistrictId(districtId: string): Promise<WardDto[]> {
    const paddedDistrictId = districtId.toString().padStart(3, '0');
    const wards = await this.wardRepository.find({
      where: { districtId: paddedDistrictId },
    });
    return wards;
  }
}
