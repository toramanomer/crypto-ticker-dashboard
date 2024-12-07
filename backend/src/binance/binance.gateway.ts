import {
	WebSocketGateway,
	SubscribeMessage,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import WebSocket from 'ws'

interface ClientSubscription {
	client: Socket
	subscribedPairs: Set<string>
}

@WebSocketGateway({ cors: { origin: '*' } })
export class BinanceGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly BINANCE_WS_URL =
		'wss://stream.binance.com:9443/ws/!ticker@arr'
	private binanceSocket: WebSocket
	private clients: Map<string, ClientSubscription> = new Map()

	afterInit() {
		this.connectToBinance()
	}

	handleConnection(client: Socket) {
		this.clients.set(client.id, { client, subscribedPairs: new Set() })
	}

	handleDisconnect(client: Socket) {
		this.clients.delete(client.id)
	}

	@SubscribeMessage('subscribeToPairs')
	handleSubscription(client: Socket, pairs: string[]) {
		const clientData = this.clients.get(client.id)
		if (!clientData) return
		pairs.forEach(pair =>
			clientData.subscribedPairs.add(pair.toLowerCase())
		)
	}

	private connectToBinance() {
		this.binanceSocket = new WebSocket(this.BINANCE_WS_URL)

		this.binanceSocket.on('message', data => {
			const updates = JSON.parse(data.toString())

			updates.forEach(
				(tradingPair: {
					s: string
					c: string
					h: string
					l: string
					p: string
					P: string
				}) => {
					const { s: symbol } = tradingPair

					this.clients.forEach(({ client, subscribedPairs }) => {
						if (subscribedPairs.has(symbol.toLowerCase())) {
							client.emit('tickerUpdate', {
								symbol: tradingPair.s,
								lastPrice: tradingPair.c,
								highPrice: tradingPair.h,
								lowPrice: tradingPair.l,
								priceChange: tradingPair.p,
								priceChangePercent: tradingPair.P
							})
						}
					})
				}
			)
		})

		this.binanceSocket.on('close', () => {
			setTimeout(() => this.connectToBinance(), 5000)
		})
	}
}
