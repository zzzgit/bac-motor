import {CardFactory, Club, Diamond, Hand, Heart, Spade} from "cardation"
import {BaccaratDeck, BaccaratShoe, RecycleShoe} from "../src"

const deck = new BaccaratDeck()
const shoe = new BaccaratShoe()
shoe.pushDeck(deck)

describe("baccaratDeck.ts", () => {
	test("detect", () => {
		const deck = new BaccaratDeck()
		// it will initialise itselt in the constructor
		// deck.getOrCreatArray()
		// deck.getCardArray().pop()
		const result = deck.detect()
		expect(result).toBe(true)
	})
	test("getOrCreatArray.content", () => {
		const result = deck.getOrCreatArray()
		expect(result[1].getCardId()).toBe("h2.2")
	})
	test("getOrCreatArray.length", () => {
		const result = deck.getOrCreatArray()
		expect(result).toHaveLength(52)
	})
	test("freeze.card", () => {
		const result = deck.getOrCreatArray()
		// eslint-disable-next-line prefer-destructuring
		const jack = result[10]
		// const id = jack.getCardId() // heart 11 jack
		const func = ():void => {
			Object.assign(jack, {rank: 9, value: 9})
		}
		expect(func).toThrow()
	})
	test("freeze.array", () => {
		// deck.getOrCreatArray()
		const result = deck.getCardArray()
		const func = ():void => {
			result.pop()
		}
		expect(func).toThrow()
	})
})

describe("baccaratShow.ts", () => {
	test("detect", () => {
		const result = shoe.detect()
		expect(result).toBe(true)
	})
	test("burn.total", () => {
		const shoe = new BaccaratShoe()
		shoe.pushDeck(deck)
		shoe.shuffle()
		const result = shoe.burn()
		const {length} = result
		expect(length + shoe.getLength()).toBe(52)
	})
	test("burn.firstcard", () => {
		const shoe = new BaccaratShoe()
		shoe.pushDeck(deck)
		shoe.shuffle()
		const result = shoe.burn()
		const {length} = result
		const [firstCard] = result
		const score = firstCard.getPoint() || 10
		expect(score + 1).toBe(length)
	})
	test("burn.twice", () => {
		const shoe = new BaccaratShoe()
		shoe.pushDeck(deck)
		shoe.shuffle()
		shoe.burn()
		const burnAgain = shoe.burn.bind(shoe)
		expect(burnAgain).toThrow()
	})
	test("pushCustomised", () => {
		const shoe = new BaccaratShoe()
		const array = deck.getDuplicatedCardArray()
		array.pop()
		array.pop()
		shoe.pushCustomised(...array)
		const result = shoe.getDuplicatedCardArray()
		expect(result).toHaveLength(50)
	})
	test("insertBlackCard", () => {
		const shoe = new BaccaratShoe()
		shoe.pushDeck(deck)
		// shoe.shuffle()
		shoe.insertBlackCard(22)
		const result = shoe.getDuplicatedCardArray()
		expect(result[22].getCardId()).toBe("b0.0")
	})
	test("reBorn", () => {
		const shoe = new BaccaratShoe()
		shoe.pushDeck(deck)
		shoe.shuffle()
		const firstBurnt = shoe.burn()
		shoe.reBorn()
		const secondBurnt = shoe.burn()
		// const result = shoe.getShoeIndex()
		const burnt = firstBurnt.length + secondBurnt.length
		expect(burnt + shoe.getLength()).toBe(52)
	})
})

describe("recycleShoe.ts", () => {
	test("collect.length", () => {
		const shoe = new RecycleShoe()
		const heart = new Heart()
		const cards = [
			CardFactory.createAceCard(heart),
			CardFactory.createNumberCard(heart, 2),
			CardFactory.createNumberCard(heart, 3),
		]
		const hand = new Hand(cards)
		shoe.collect(hand)
		expect(shoe.getDuplicatedCardArray()).toHaveLength(3)
	})
	test("collect.shouldShuffle", () => {
		const shoe = new RecycleShoe()
		const heart = new Heart()
		const club = new Club()
		const spade = new Spade()
		const cards = []
		cards.push(CardFactory.createAceCard(heart))
		cards.push(CardFactory.createAceCard(club))
		cards.push(CardFactory.createAceCard(spade))
		for (let i = 2; i < 10; i++) {
			cards.push(CardFactory.createNumberCard(heart, i))
			cards.push(CardFactory.createNumberCard(club, i))
			cards.push(CardFactory.createNumberCard(spade, i))
		}
		const hand = new Hand(cards)
		// 使其原本就有20張牌以上
		shoe.collect(hand)
		const diamond = new Diamond()
		const newHand = new Hand([
			CardFactory.createNumberCard(diamond, 5), // 必須是5
			CardFactory.createFaceCard(club, 11),
			CardFactory.createFaceCard(spade, 12),	// s12.12, 這是最後一張，驗證他可以知道是否有排序
		])
		shoe.collect(newHand, true)
		const result = shoe.getDuplicatedCardArray()
		const lastCard = result[result.length - 1]
		expect(lastCard.getCardId()).not.toBe("s12.12")
	})
	test("collect.clear", () => {
		const shoe = new RecycleShoe()
		const heart = new Heart()
		const cards = []
		cards.push(CardFactory.createAceCard(heart))
		cards.push(CardFactory.createNumberCard(heart, 2))
		cards.push(CardFactory.createNumberCard(heart, 3))
		const hand = new Hand(cards)
		shoe.collect(hand)
		expect(hand.getDuplicatedCardArray()).toHaveLength(0)
	})
})
