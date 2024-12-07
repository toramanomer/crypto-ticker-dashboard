import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom, catchError } from 'rxjs'
import { AxiosError } from 'axios'

interface SymbolDetails {
	symbol: string
	priceChange: string
	priceChangePercent: string
	lastPrice: string
	highPrice: string
	lowPrice: string
}

@Injectable()
export class BinanceService {
	private readonly BASE_URL = 'https://api.binance.com/api/v3'

	constructor(private readonly httpService: HttpService) {}

	async getTradingPairs() {
		const response = await lastValueFrom(
			this.httpService
				.get<SymbolDetails[]>(this.BASE_URL.concat('/ticker/24hr'))
				.pipe(
					catchError((error: AxiosError) => {
						throw new ServiceUnavailableException()
					})
				)
		)

		return response.data
			.sort((a, b) => parseFloat(b.lastPrice) - parseFloat(a.lastPrice))
			.slice(0, 100)
			.map(pair => ({
				symbol: pair.symbol,
				lastPrice: pair.lastPrice,
				highPrice: pair.highPrice,
				lowPrice: pair.lowPrice,
				priceChange: pair.priceChange,
				priceChangePercent: pair.priceChangePercent
			}))
	}
}
