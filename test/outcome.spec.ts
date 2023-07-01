import {CardFactory, Diamond, FaceCard, Heart, NumberCard} from "cardation"
import {
	Bet,
	BancoMun,
	HandOutcome,
	HandResult,
	defaultConfig,
	FreeMun,
	TieMun,
	SuperSixMun,
	PuntoMun,
} from "../src"

const bet = new Bet(new BancoMun(), 100)
const ace = CardFactory.createAceCard(new Diamond(), 1)
const two = CardFactory.createNumberCard(new Diamond(), 2, 2)
const outcome = new HandOutcome(
	HandResult.BancoWins,
	20,
	30,
	[ace, two],
	[ace, two],
	0,
	3
)
const config = defaultConfig
const heart = new Heart()

describe("handoutcome.ts", () => {
	test("getPayout.invalidconfig", () => {
		const func = (): number => HandOutcome.getPayout(bet, outcome, {})
		expect(func).toThrow()
	})
	test("getPayout.freegame", () => {
		const bet = new Bet(new FreeMun(), 100)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(0)
	})
	test("getPayout.banker.lose", () => {
		const bet = new Bet(new BancoMun(), 100)
		const outcome = new HandOutcome(
			HandResult.PuntoWins,
			20,
			30,
			[ace, two],
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(0)
	})
	test("getPayout.banker.nocommision", () => {
		const bet = new Bet(new BancoMun(), 1000)
		const outcome = new HandOutcome(
			HandResult.BancoWins,
			20,
			30,
			[ace, two],
			[ace, two],
			0,
			3
		)
		const config = Object.assign({}, defaultConfig)
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		config.gameRules!.isNoCommision = true
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(2000)
	})
	test("getPayout.banker.6", () => {
		const bhand = [new NumberCard(heart, 6, 6), new FaceCard(heart, 11, 0)]
		const outcome = new HandOutcome(
			HandResult.BancoWins,
			20,
			30,
			bhand,
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(150)
	})
	test("getPayout.player", () => {
		const bet = new Bet(new PuntoMun(), 100)
		const outcome = new HandOutcome(
			HandResult.PuntoWins,
			20,
			30,
			[ace, two],
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(200)
	})
	test("getPayout.player.tie", () => {
		const bet = new Bet(new PuntoMun(), 100)
		const outcome = new HandOutcome(
			HandResult.Tie,
			20,
			30,
			[ace, two],
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(100)
	})
	test("getPayout.player.lose", () => {
		const bet = new Bet(new PuntoMun(), 100)
		const outcome = new HandOutcome(
			HandResult.BancoWins,
			20,
			30,
			[ace, two],
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(0)
	})
	test("getPayout.tie", () => {
		const bet = new Bet(new TieMun(), 100)
		const outcome = new HandOutcome(
			HandResult.Tie,
			20,
			30,
			[ace, two],
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(900)
	})
	test("getPayout.tie.lose", () => {
		const bet = new Bet(new TieMun(), 100)
		const outcome = new HandOutcome(
			HandResult.PuntoWins,
			20,
			30,
			[ace, two],
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(0)
	})
	test("getPayout.SuperSix", () => {
		const bet = new Bet(new SuperSixMun(), 100)
		const bhand = [new NumberCard(heart, 6, 6), new FaceCard(heart, 11, 0)]
		const outcome = new HandOutcome(
			HandResult.BancoWins,
			20,
			30,
			bhand,
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(1300)
	})
	test("getPayout.SuperSix.lose", () => {
		const bet = new Bet(new SuperSixMun(), 100)
		const bhand = [new NumberCard(heart, 5, 5), new FaceCard(heart, 11, 0)]
		const outcome = new HandOutcome(
			HandResult.BancoWins,
			20,
			30,
			bhand,
			[ace, two],
			0,
			3
		)
		const payout = HandOutcome.getPayout(bet, outcome, config)
		expect(payout).toBe(0)
	})
})
