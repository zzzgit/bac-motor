import {BaccaratDeck} from "../src"

describe("baccaratDeck.ts", () => {
	test("detect", () => {
		const deck = new BaccaratDeck()
		deck.getOrCreatArray()
		const result = deck.detect()
		expect(result).toBe(true)
	})
})
