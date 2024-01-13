import { CardFactory, Diamond } from 'cardation'
import { Bet, HandOutcome, HandResult } from '../src'
import Banco from '../src/model/mun/Banco'
import Free from '../src/model/mun/Free'
import Tie from '../src/model/mun/Tie'

const freeBet = new Bet(new Free(), 100)
const bankerBet = new Bet(new Banco(), 100)
const ace = CardFactory.createAceCard(new Diamond(), 1)
const two = CardFactory.createNumberCard(new Diamond(), 2, 2)
const handOutcome_b = new HandOutcome(
	HandResult.BancoWins,
	20,
	100,
	[ace, two],
	[ace, two],
	20,
	0
)
bankerBet.setOutcome(handOutcome_b)
const tieBet = new Bet(new Tie(), 100)
const handOutcome_tie = new HandOutcome(
	HandResult.Tie,
	20,
	100,
	[ace, two],
	[ace, two],
	20,
	0
)
tieBet.setOutcome(handOutcome_tie)

describe('bet.ts', () => {
	test('getStr.free', () => {
		const str = freeBet.getStr()
		expect(str).toBe('0')
	})
	test('getStr.banker', () => {
		const str = bankerBet.getStr()
		expect(str).toBe('B+100')
	})
	test('getStr.tie', () => {
		const str = tieBet.getStr()
		expect(str).toBe('0')
	})
	test('gotWon.banker', () => {
		const isWon = bankerBet.gotWon()
		expect(isWon).toBe(true)
	})
	test('gotTie', () => {
		const isWon = tieBet.gotTie()
		expect(isWon).toBe(true)
	})
})
