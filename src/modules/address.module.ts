import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from 'src/services/address.service';
import { AddressController } from 'src/controllers/address.controller';
import { Province } from 'src/entities/province.entity';
import { Ward } from 'src/entities/ward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Province, Ward])],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
