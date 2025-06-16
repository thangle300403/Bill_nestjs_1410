import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportController } from 'src/controllers/transport.controller';
import { Transport } from 'src/entities/transport.entity';
import { TransportService } from 'src/services/transport.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transport])],
  controllers: [TransportController],
  providers: [TransportService],
})
export class TransportModule {}
