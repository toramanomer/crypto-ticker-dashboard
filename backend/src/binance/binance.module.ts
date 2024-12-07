import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { BinanceController } from './binance.controller'
import { BinanceService } from './binance.service'
import { BinanceGateway } from './binance.gateway'

@Module({
	imports: [HttpModule],
	controllers: [BinanceController],
	providers: [BinanceService, BinanceGateway]
})
export class BinanceModule {}
