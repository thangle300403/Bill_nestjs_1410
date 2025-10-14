import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { Ward } from 'src/entities/ward.entity';
import { CustomerService } from 'src/services/customer.service';
import { CustomerController } from 'src/controllers/customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Ward])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
