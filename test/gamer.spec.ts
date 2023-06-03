import {CardFactory, Heart} from "cardation"
import {Gamer} from "../src"

const heart = new Heart()
const card2 = CardFactory.createNumberCard(heart, 2)
const card3 = CardFactory.createNumberCard(heart, 3)

describe("gamer.ts", () => {
	it("getPoint", () => {
		const gamer = new Gamer()
		gamer.acceptCard(card2)
		gamer.acceptCard(card3)
		expect(gamer.getPoint()).toBe(5)
	})
	it("getLastCard.normal", () => {
		const gamer = new Gamer()
		gamer.acceptCard(card2)
		gamer.acceptCard(card3)
		expect(gamer.getLastCard()).toBe(card3)
	})
	it("getLastCard.empty", () => {
		const gamer = new Gamer()
		const func = gamer.getLastCard.bind(gamer)
		expect(func).toThrow("there's no last card because the hand is empty!")
	})
})
